import { walletErrorDetails } from '../utils/walletErrors'

export function buildTrustWalletLink(uri: string): string {
  return `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`
}

export function buildTrustWalletSchemeLink(uri: string): string {
  return `trust://wc?uri=${encodeURIComponent(uri)}`
}

export function openTrustWalletUniversal(uri: string): boolean {
  if (!uri) return false
  try {
    console.info('[TRUST] Universal link navigation started')
    window.location.assign(buildTrustWalletLink(uri))
    return true
  } catch (error) {
    console.error('[TRUST] Universal link navigation failed', walletErrorDetails(error))
    return false
  }
}

export function openTrustWalletScheme(uri: string): boolean {
  if (!uri) return false
  try {
    console.info('[TRUST] Custom scheme navigation started')
    window.location.assign(buildTrustWalletSchemeLink(uri))
    return true
  } catch (error) {
    console.error('[TRUST] Custom scheme navigation failed', walletErrorDetails(error))
    return false
  }
}
