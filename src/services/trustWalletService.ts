import { walletErrorDetails } from '../utils/walletErrors'

export function buildTrustWalletLink(uri: string): string {
  return `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`
}

export function buildTrustWalletSchemeLink(uri: string): string {
  return `trust://wc?uri=${encodeURIComponent(uri)}`
}

export type TrustLaunchPlatform = 'ios-safari' | 'android-chrome' | 'desktop' | 'other-mobile'

export function detectTrustLaunchPlatform(userAgent: string, platform = ''): TrustLaunchPlatform {
  const ios = /iPhone|iPad|iPod/i.test(userAgent) || (platform === 'MacIntel' && /Macintosh/i.test(userAgent))
  if (ios && /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(userAgent)) return 'ios-safari'
  if (/Android/i.test(userAgent) && /Chrome/i.test(userAgent)) return 'android-chrome'
  if (/Android|iPhone|iPad|iPod/i.test(userAgent)) return 'other-mobile'
  return 'desktop'
}

export function getTrustLaunchPlatform(): TrustLaunchPlatform {
  return detectTrustLaunchPlatform(navigator.userAgent, navigator.platform)
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
