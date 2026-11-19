import { describe, expect, it } from 'vitest'
import { buildTrustWalletLink, buildTrustWalletSchemeLink } from './trustWalletService'

describe('Trust Wallet WalletConnect links', () => {
  it('uses the official universal link and encodes the complete pairing URI', () => {
    const uri = 'wc:topic@2?relay-protocol=irn&symKey=a+b/c='
    expect(buildTrustWalletLink(uri)).toBe(
      `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`,
    )
  })

  it('builds the Trust Wallet app-scheme fallback with the same encoded URI', () => {
    const uri = 'wc:topic@2?relay-protocol=irn&symKey=a+b/c='
    expect(buildTrustWalletSchemeLink(uri)).toBe(
      `trust://wc?uri=${encodeURIComponent(uri)}`,
    )
  })
})
