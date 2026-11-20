import { describe, expect, it } from 'vitest'
import {
  buildTrustWalletLink,
  buildTrustWalletSchemeLink,
  detectTrustLaunchPlatform,
} from './trustWalletService'

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

  it('detects supported browser platform classes without asserting app installation', () => {
    expect(detectTrustLaunchPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/605.1')).toBe('ios-safari')
    expect(detectTrustLaunchPlatform('Mozilla/5.0 (Linux; Android 14) Chrome/120.0 Mobile Safari/537.36')).toBe('android-chrome')
    expect(detectTrustLaunchPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0')).toBe('desktop')
  })
})
