import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  discoverInjectedWallets,
  isTrustWalletMetadata,
  parseChainId,
} from './walletDiscoveryService'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('injected wallet discovery', () => {
  it('only identifies Trust Wallet from provider metadata', () => {
    expect(isTrustWalletMetadata({ name: 'Trust Wallet', rdns: 'com.trustwallet.app' })).toBe(true)
    expect(isTrustWalletMetadata({ name: 'Browser wallet', rdns: 'unknown' })).toBe(false)
  })

  it('parses decimal and hexadecimal chain identifiers', () => {
    expect(parseChainId('0x38')).toBe(56)
    expect(parseChainId(1)).toBe(1)
    expect(parseChainId('not-a-chain')).toBeNull()
  })

  it('discovers EIP-6963 providers and reads accounts and chain without prompting', async () => {
    const request = vi.fn(async ({ method }: { method: string }) => {
      if (method === 'eth_accounts') return ['0x2222222222222222222222222222222222222222']
      if (method === 'eth_chainId') return '0x38'
      throw new Error('Unexpected request')
    })
    const provider = { request }
    const listeners = new Map<string, (event: unknown) => void>()
    const fakeWindow = {
      ethereum: undefined,
      addEventListener: (name: string, handler: (event: unknown) => void) => listeners.set(name, handler),
      removeEventListener: (name: string) => listeners.delete(name),
      dispatchEvent: (event: { type: string }) => {
        if (event.type === 'eip6963:requestProvider') {
          listeners.get('eip6963:announceProvider')?.({
            detail: {
              info: { uuid: 'trust-1', name: 'Trust Wallet', rdns: 'com.trustwallet.app' },
              provider,
            },
          })
        }
        return true
      },
    }
    vi.stubGlobal('window', fakeWindow)

    const wallets = await discoverInjectedWallets(0)
    expect(wallets).toHaveLength(1)
    expect(wallets[0]).toMatchObject({
      account: '0x2222222222222222222222222222222222222222',
      chainId: 56,
      canReadAccounts: true,
      canReadChain: true,
      isTrustWallet: true,
    })
    expect(request).toHaveBeenCalledTimes(2)
    expect(request).not.toHaveBeenCalledWith(expect.objectContaining({ method: 'eth_requestAccounts' }))
  })
})
