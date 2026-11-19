import { walletErrorDetails } from '../utils/walletErrors'

export function buildTrustWalletLink(uri: string): string {
  return `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`
}

export function buildTrustWalletSchemeLink(uri: string): string {
  return `trust://wc?uri=${encodeURIComponent(uri)}`
}

export function navigateTrustWallet(tab: Window | null, uri: string): boolean {
  if (!tab || tab.closed) {
    console.warn('[TRUST] Temporary tab unavailable; use the in-app QR or Trust Wallet link.')
    return false
  }
  try {
    console.info('[TRUST] Deep link constructed')
    console.info('[TRUST] Temporary tab navigation started')
    tab.location.href = buildTrustWalletLink(uri)
    return true
  } catch (error) {
    console.error('[TRUST] Temporary tab navigation failed', walletErrorDetails(error))
    if (!tab.closed) tab.close()
    return false
  }
}
