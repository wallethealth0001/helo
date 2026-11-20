import { useEffect, useRef, useState } from 'react'
import type UniversalProvider from '@walletconnect/universal-provider'
import { walletConnectService } from '../services/walletConnectService'
import { BSC } from '../config/chains'
import type { WalletStatus } from '../types/wallet'
import { isAddress } from '../utils/address'
import { walletErrorDetails, walletErrorMessage } from '../utils/walletErrors'
import {
  buildTrustWalletLink,
  getTrustLaunchPlatform,
  openTrustWalletScheme,
} from '../services/trustWalletService'

type WalletSession = NonNullable<UniversalProvider['session']>
type ConnectionMethod = 'qr' | 'trust'

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [provider, setProvider] = useState<unknown>(null)
  const [status, setStatus] = useState<WalletStatus>('initializing')
  const [uri, setUri] = useState<string | null>(null)
  const [trustWalletLink, setTrustWalletLink] = useState<string | null>(null)
  const [trustLaunchStatus, setTrustLaunchStatus] = useState<'idle' | 'attempted' | 'backgrounded' | 'returned' | 'connected'>('idle')
  const [uriCopied, setUriCopied] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const connectionInProgress = useRef(false)
  const cancelled = useRef(false)
  const lastConnectionMethod = useRef<ConnectionMethod>('qr')

  const applySession = (wcProvider: UniversalProvider, session: WalletSession) => {
    const namespace = session.namespaces.eip155
    const approvedAccount = namespace?.accounts
      .map((account) => account.split(':'))
      .find((parts) => parts.length === 3 && parts[0] === 'eip155' && parts[1] === String(BSC.id) && isAddress(parts[2]))
    if (!approvedAccount) {
      throw Object.assign(new Error('The approved session does not include a valid BNB Smart Chain account.'), {
        code: 'WC_BSC_ACCOUNT_MISSING',
      })
    }
    const extracted = approvedAccount[2]
    setAccount(extracted)
    setChainId(extracted ? BSC.id : null)
    setProvider(wcProvider)
    setStatus(extracted ? 'connected' : 'waiting')
    setTrustLaunchStatus('connected')
    console.info('[WalletConnect] Account retrieved')
    console.info('[WalletConnect] Session approved')
  }

  useEffect(() => {
    let mounted = true
    void walletConnectService.restore()
      .then((restored) => {
        if (!mounted || cancelled.current) return
        if (restored) applySession(restored.provider, restored.session)
        else setStatus('ready')
      })
      .catch((caught) => {
        if (!mounted || cancelled.current) return
        setError(walletErrorMessage(caught))
        setStatus('failed')
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setTrustLaunchStatus((current) => {
          if (current !== 'attempted') return current
          console.info('[Trust Wallet] Browser backgrounded after launch attempt')
          return 'backgrounded'
        })
      } else {
        setTrustLaunchStatus((current) => {
          if (current !== 'attempted' && current !== 'backgrounded') return current
          console.info('[Trust Wallet] Browser returned to foreground; session verification pending')
          return 'returned'
        })
      }
    }
    const handlePageShow = () => {
      setTrustLaunchStatus((current) => {
        if (current !== 'attempted' && current !== 'backgrounded') return current
        console.info('[Trust Wallet] Browser page shown; session verification pending')
        return 'returned'
      })
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pageshow', handlePageShow)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [])

  useEffect(() => {
    const wcProvider = walletConnectService.getProvider()
    if (!wcProvider) return
    const onAccounts = (accounts: string[]) => {
      const nextAccount = accounts[0]
      if (nextAccount && !isAddress(nextAccount)) {
        const invalidAccountError = new Error('The wallet returned an invalid account address.')
        console.error('[WalletConnect] Account retrieval failed', walletErrorDetails(invalidAccountError))
        setAccount(null)
        setStatus('failed')
        setError(walletErrorMessage(invalidAccountError))
        return
      }
      setAccount(nextAccount ?? null)
      setStatus(nextAccount ? 'connected' : 'disconnected')
    }
    const onChain = (nextChain: string | number) => {
      const chain = String(nextChain).replace('eip155:', '')
      const id = chain.startsWith('0x') ? Number.parseInt(chain, 16) : Number(chain)
      setChainId(id)
    }
    const onDisconnect = () => {
      console.info('[WalletConnect] Session disconnected')
      setAccount(null)
      setChainId(null)
      setStatus('disconnected')
    }
    wcProvider.on?.('accountsChanged', onAccounts)
    wcProvider.on?.('chainChanged', onChain)
    wcProvider.on?.('disconnect', onDisconnect)
    return () => {
      wcProvider.off?.('accountsChanged', onAccounts)
      wcProvider.off?.('chainChanged', onChain)
      wcProvider.off?.('disconnect', onDisconnect)
    }
  }, [provider])

  const runConnection = async (method: ConnectionMethod) => {
    if (connectionInProgress.current) return
    connectionInProgress.current = true
    cancelled.current = false
    lastConnectionMethod.current = method
    setInitializing(true)
    setStatus('initializing')
    setError(null)
    setUri(null)
    setTrustWalletLink(null)
    setTrustLaunchStatus('idle')
    try {
      const result = await walletConnectService.connect((nextUri) => {
        if (cancelled.current) return
        setUri(nextUri)
        setUriCopied(false)
        setStatus('waiting')
        if (method === 'trust') {
          const link = buildTrustWalletLink(nextUri)
          setTrustWalletLink(link)
          console.info('[WalletConnect] URI generated')
          console.info('[Trust Wallet] Launch link ready; awaiting user action')
          setError(null)
        }
        console.info('[WalletConnect] Waiting for approval')
      }, () => {
        setInitializing(false)
        setStatus('connecting')
      })
      if (cancelled.current) return
      applySession(result.provider, result.session)
      setError(null)
      setUri(null)
      setUriCopied(false)
      setTrustWalletLink(null)
      setTrustLaunchStatus('connected')
    } catch (caught) {
      if (cancelled.current) return
      const details = walletErrorDetails(caught)
      console.error('[WC] Connection failed', details)
      console.error('[WalletConnect] Connection failed', details)
      setStatus('failed')
      setError(walletErrorMessage(caught))
    } finally {
      connectionInProgress.current = false
      setInitializing(false)
    }
  }

  const connectQr = () => {
    void runConnection('qr')
  }

  const connectTrust = () => {
    if (connectionInProgress.current) return
    console.info('[TRUST] Button clicked')
    void runConnection('trust')
  }

  const retry = () => {
    if (lastConnectionMethod.current === 'trust') connectTrust()
    else connectQr()
  }

  const retryTrustWallet = () => {
    if (!uri) return
    console.info('[Trust Wallet] Launch attempted', { platform: getTrustLaunchPlatform(), method: 'custom-scheme' })
    setTrustLaunchStatus('attempted')
    console.info('[Trust Wallet] Deep link navigation attempted')
    if (!openTrustWalletScheme(uri)) {
      setError('Safari blocked the Trust Wallet app link. Use the QR code or copy the WalletConnect URI.')
    }
  }

  const launchTrustWallet = () => {
    if (!uri || !trustWalletLink) return
    console.info('[Trust Wallet] Launch attempted', { platform: getTrustLaunchPlatform(), method: 'universal-link' })
    console.info('[Trust Wallet] Deep link navigation attempted')
    setTrustLaunchStatus('attempted')
  }

  const copyUri = async () => {
    if (!uri) return
    try {
      await navigator.clipboard.writeText(uri)
      setUriCopied(true)
      setError(null)
    } catch (caught) {
      const details = walletErrorDetails(caught)
      console.error('[WC] URI copy failed', details)
      setError('Could not copy the WalletConnect URI. Scan the QR code or retry Trust Wallet.')
    }
  }

  const cancel = async () => {
    cancelled.current = true
    walletConnectService.cancelConnection()
    setUri(null)
    setUriCopied(false)
    setTrustWalletLink(null)
    setTrustLaunchStatus('idle')
    setError(null)
    setStatus('cancelled')
  }

  const disconnect = async () => {
    try {
      await walletConnectService.disconnect()
      setAccount(null)
      setChainId(null)
      setProvider(null)
      setStatus('disconnected')
    } catch (caught) {
      const details = walletErrorDetails(caught)
      console.error('[WalletConnect] Disconnect failed', details)
      setError(walletErrorMessage(caught))
    }
  }

  const switchToBsc = async () => {
    const wcProvider = walletConnectService.getProvider()
    if (!wcProvider) throw new Error('Connect a wallet before switching networks.')
    setSwitching(true)
    setError(null)
    try {
      await wcProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC.hexId }],
      })
      setChainId(BSC.id)
    } catch (caught) {
      const errorCode = (caught as { code?: number })?.code
      if (errorCode === 4902) {
        await wcProvider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: BSC.hexId,
            chainName: BSC.name,
            nativeCurrency: BSC.nativeCurrency,
            rpcUrls: BSC.rpcUrls,
            blockExplorerUrls: [BSC.blockExplorer],
          }],
        })
        setChainId(BSC.id)
      } else {
        const details = walletErrorDetails(caught)
        console.error('[WalletConnect] Network switch failed', details)
        setError(walletErrorMessage(caught))
      }
    } finally {
      setSwitching(false)
    }
  }

  return {
    account, chainId, provider, status, uri, trustWalletLink, trustLaunchStatus, uriCopied, initializing, switching, error,
    connectQr, connectTrust, retry, retryTrustWallet, launchTrustWallet, copyUri, cancel, disconnect, switchToBsc,
  }
}
