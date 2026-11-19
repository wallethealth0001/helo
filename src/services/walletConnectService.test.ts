import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type UniversalProvider from '@walletconnect/universal-provider'

const { initMock } = vi.hoisted(() => ({ initMock: vi.fn() }))

vi.mock('@walletconnect/universal-provider', () => ({
  default: { init: initMock },
}))

describe('WalletConnect pairing', () => {
  const uri = 'wc:topic@2?relay-protocol=irn&symKey=secret'
  const approvedSession = {
    topic: 'topic',
    pairingTopic: 'pairing-topic',
    relay: { protocol: 'irn' },
    expiry: 1,
    acknowledged: true,
    controller: 'controller',
    namespaces: {
      eip155: {
        accounts: ['eip155:56:0x0123456789abcdef0123456789abcdef01234567'],
        methods: ['eth_sendTransaction'],
        events: ['accountsChanged', 'chainChanged'],
      },
    },
    requiredNamespaces: {},
    optionalNamespaces: {},
    self: {
      publicKey: 'self-key',
      metadata: { name: 'Test wallet', description: 'test', url: 'https://test.example', icons: [] },
    },
    peer: {
      publicKey: 'peer-key',
      metadata: { name: 'Test app', description: 'test', url: 'https://test.example', icons: [] },
    },
  } satisfies NonNullable<UniversalProvider['session']>

  let service: typeof import('./walletConnectService').walletConnectService
  let provider: {
    on: ReturnType<typeof vi.fn>
    off: ReturnType<typeof vi.fn>
    connect: ReturnType<typeof vi.fn>
    abortPairingAttempt: ReturnType<typeof vi.fn>
    session?: NonNullable<UniversalProvider['session']>
  }
  let listeners: Map<string, (value: string) => void>

  beforeEach(async () => {
    vi.resetModules()
    vi.stubEnv('VITE_WALLETCONNECT_PROJECT_ID', 'test-project-id')
    vi.stubGlobal('window', { location: { origin: 'https://test.example' } })
    listeners = new Map()
    provider = {
      on: vi.fn((event: string, listener: (value: string) => void) => {
        listeners.set(event, listener)
      }),
      off: vi.fn((event: string) => {
        listeners.delete(event)
      }),
      connect: vi.fn(),
      abortPairingAttempt: vi.fn(),
    }
    initMock.mockResolvedValue(provider)
    service = (await import('./walletConnectService')).walletConnectService
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('registers display_uri before connect, forwards the URI while approval is pending, then removes the listener', async () => {
    const steps: string[] = []
    provider.on.mockImplementation((event: string, listener: (value: string) => void) => {
      steps.push('listener')
      listeners.set(event, listener)
    })
    provider.connect.mockImplementation(async () => {
      steps.push('connect')
      listeners.get('display_uri')?.(uri)
      return approvedSession
    })

    await service.connect(() => steps.push('uri'))

    expect(steps).toEqual(['listener', 'connect', 'uri'])
    expect(provider.off).toHaveBeenCalledWith('display_uri', expect.any(Function))
    expect(listeners.has('display_uri')).toBe(false)
  })

  it('rejects invalid pairing URIs and still removes the display listener', async () => {
    provider.connect.mockImplementation(async () => {
      listeners.get('display_uri')?.('not-a-walletconnect-uri')
      return new Promise(() => undefined)
    })

    await expect(service.connect(() => undefined)).rejects.toMatchObject({
      code: 'WC_URI_INVALID',
    })
    expect(provider.off).toHaveBeenCalledWith('display_uri', expect.any(Function))
  })
})
