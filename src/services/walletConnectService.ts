import UniversalProvider from '@walletconnect/universal-provider'
import { BSC } from '../config/chains'
import { WALLETCONNECT_PROJECT_ID } from '../config/walletConnect'
import { walletErrorDetails } from '../utils/walletErrors'

type DisplayUriHandler = (uri: string) => void

let provider: UniversalProvider | null = null
let initializationPromise: Promise<UniversalProvider> | null = null
let connectionPromise: Promise<{ provider: UniversalProvider; session: NonNullable<UniversalProvider['session']> }> | null = null
let connectionCancelled = false

export const walletConnectService = {
  async initialize() {
    if (provider) return provider
    if (initializationPromise) return initializationPromise

    const pending = (async () => {
      console.info('[WalletConnect] Initialization started')
      console.info('[WC] Provider initialization started')
      let timeoutId: ReturnType<typeof setTimeout> | undefined
      try {
        const projectId = WALLETCONNECT_PROJECT_ID?.trim()
        if (!projectId || projectId === 'your_walletconnect_project_id') {
          throw Object.assign(
            new Error('Set VITE_WALLETCONNECT_PROJECT_ID in .env.local using a WalletConnect Cloud project ID.'),
            { code: 'WC_PROJECT_ID_MISSING' },
          )
        }

        const initialized = await Promise.race([
          UniversalProvider.init({
            projectId,
            metadata: {
              name: 'BSC Wallet Center',
              description: 'Transparent BNB Smart Chain wallet and approval management',
              url: window.location.origin,
              icons: [`${window.location.origin}/favicon.svg`],
            },
          }),
          new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(Object.assign(new Error('WalletConnect initialization timed out after 15 seconds.'), {
                code: 'WC_INITIALIZATION_TIMEOUT',
              }))
            }, 15_000)
          }),
        ])
        provider = initialized
        console.info('[WalletConnect] Initialization successful', { origin: window.location.origin })
        console.info('[WC] Provider initialization completed')
        return initialized
      } catch (error) {
        const details = walletErrorDetails(error)
        console.error('[WalletConnect] Initialization failed', details)
        throw error
      } finally {
        if (timeoutId) clearTimeout(timeoutId)
      }
    })()
    initializationPromise = pending
    try {
      return await pending
    } catch (error) {
      if (initializationPromise === pending) initializationPromise = null
      throw error
    }
  },

  async connect(onDisplayUri: DisplayUriHandler, onInitialized?: () => void) {
    if (connectionPromise) {
      throw Object.assign(new Error('A WalletConnect request is already pending.'), {
        code: 'WC_CONNECTION_IN_PROGRESS',
      })
    }
    connectionCancelled = false

    const pending = (async () => {
      const wcProvider = await this.initialize()
      if (connectionCancelled) {
        throw Object.assign(new Error('The WalletConnect request was cancelled.'), {
          code: 'WC_CONNECTION_CANCELLED',
        })
      }
      onInitialized?.()
      let timeoutId: ReturnType<typeof setTimeout> | undefined
      let rejectConnectionTimeout: ((error: Error) => void) | undefined
      const connectionTimeout = new Promise<never>((_, reject) => {
        rejectConnectionTimeout = reject
      })
      const scheduleConnectionTimeout = (stage: 'uri' | 'approval') => {
        if (timeoutId) clearTimeout(timeoutId)
        const isUriTimeout = stage === 'uri'
        timeoutId = setTimeout(() => {
          rejectConnectionTimeout?.(Object.assign(
            new Error(isUriTimeout
              ? 'WalletConnect did not return a pairing URI within 30 seconds. Check relay connectivity and the WalletConnect origin allowlist.'
              : 'WalletConnect session approval timed out after 5 minutes. Reconnect and approve the request in your wallet.'),
            { code: isUriTimeout ? 'WC_URI_TIMEOUT' : 'WC_APPROVAL_TIMEOUT' },
          ))
        }, isUriTimeout ? 30_000 : 5 * 60_000)
      }
      const handleDisplayUri = (uri: string) => {
        console.info('[WC] display_uri received')
        if (typeof uri !== 'string' || !/^wc:[^\s?]+@2(?:\?|$)/.test(uri.trim())) {
          rejectConnectionTimeout?.(Object.assign(
            new Error('WalletConnect returned an invalid pairing URI.'),
            { code: 'WC_URI_INVALID' },
          ))
          return
        }
        console.info('[WC] URI validated')
        scheduleConnectionTimeout('approval')
        console.info('[WalletConnect] URI received')
        onDisplayUri(uri.trim())
      }
      wcProvider.on('display_uri', handleDisplayUri)
      console.info('[WC] URI listener registered')
      try {
        console.info('[WalletConnect] Connection initiated')
        console.info('[WC] Connecting')
        scheduleConnectionTimeout('uri')
        try {
          const session = await Promise.race([
            wcProvider.connect({
              optionalNamespaces: {
                eip155: {
                  chains: [`eip155:${BSC.id}`],
                  methods: ['eth_sendTransaction'],
                  events: ['accountsChanged', 'chainChanged'],
                },
              },
            }),
            connectionTimeout,
          ])
          if (!session) {
            throw Object.assign(new Error('The wallet did not approve a WalletConnect session.'), {
              code: 'WC_SESSION_NOT_APPROVED',
            })
          }
          console.info('[WalletConnect] Session approved')
          console.info('[WC] Session approved')
          return { provider: wcProvider, session }
        } catch (error) {
          const errorCode = walletErrorDetails(error).code
          if (errorCode === 'WC_URI_TIMEOUT' || errorCode === 'WC_APPROVAL_TIMEOUT') {
            wcProvider.abortPairingAttempt()
          }
          throw error
        } finally {
          if (timeoutId) clearTimeout(timeoutId)
        }
      } finally {
        wcProvider.off('display_uri', handleDisplayUri)
      }
    })()

    connectionPromise = pending
    try {
      return await pending
    } finally {
      if (connectionPromise === pending) connectionPromise = null
    }
  },

  async restore() {
    const wcProvider = await this.initialize()
    return wcProvider.session ? { provider: wcProvider, session: wcProvider.session } : null
  },

  cancelConnection() {
    connectionCancelled = true
    provider?.abortPairingAttempt()
  },

  async disconnect() {
    if (!provider) return
    await provider.disconnect()
  },

  async requestTransaction(from: string, to: string, data: string, value = '0x0') {
    if (!provider) throw new Error('WalletConnect provider is unavailable.')
    return provider.request<string>({
      method: 'eth_sendTransaction',
      params: [{ from, to, data, value, chainId: '0x38' }],
    }, `eip155:${BSC.id}`)
  },

  getProvider() {
    return provider
  },
}
