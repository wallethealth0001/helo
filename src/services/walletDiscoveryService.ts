import type { InjectedProviderInfo, InjectedWallet } from '../types/injectedWallet'
import { isAddress } from '../utils/address'

interface Eip1193Provider {
  request?: (request: { method: string; params?: unknown[] }) => Promise<unknown>
  providers?: Eip1193Provider[]
  providerInfo?: Partial<InjectedProviderInfo>
  isTrust?: boolean
}

interface Announcement {
  info?: Partial<InjectedProviderInfo>
  provider?: Eip1193Provider
}

async function requestCapability(provider: Eip1193Provider, method: string): Promise<unknown> {
  if (!provider.request) throw new Error('Provider request is unavailable.')
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      provider.request({ method }),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${method} capability check timed out.`)), 2_000)
      }),
    ])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

export function isTrustWalletMetadata(info: Partial<InjectedProviderInfo>): boolean {
  return /trust\s*wallet|trustwallet/i.test(`${info.name ?? ''} ${info.rdns ?? ''}`)
}

export function parseChainId(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const parsed = typeof value === 'string'
    ? Number.parseInt(value, value.startsWith('0x') ? 16 : 10)
    : value
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null
}

function providerInfo(provider: Eip1193Provider, index: number, announced?: Partial<InjectedProviderInfo>): InjectedProviderInfo {
  const info = announced ?? provider.providerInfo ?? {}
  const trustFlag = provider.isTrust === true
  return {
    uuid: info.uuid || `injected-${index}`,
    name: info.name || (trustFlag ? 'Trust Wallet (injected provider)' : 'Injected wallet'),
    icon: info.icon,
    rdns: info.rdns || (trustFlag ? 'com.trustwallet.app' : 'unknown'),
  }
}

async function inspectProvider(
  provider: Eip1193Provider,
  info: InjectedProviderInfo,
): Promise<InjectedWallet> {
  const canRequest = typeof provider.request === 'function'
  let account: string | null = null
  let chainId: number | null = null
  let canReadAccounts = false
  let canReadChain = false

  if (canRequest && provider.request) {
    const [accountsResult, chainResult] = await Promise.allSettled([
      requestCapability(provider, 'eth_accounts'),
      requestCapability(provider, 'eth_chainId'),
    ])
    if (accountsResult.status === 'fulfilled' && Array.isArray(accountsResult.value)) {
      canReadAccounts = true
      const candidate = accountsResult.value[0]
      if (typeof candidate === 'string' && isAddress(candidate)) account = candidate
    }
    if (chainResult.status === 'fulfilled') {
      const parsed = parseChainId(chainResult.value)
      canReadChain = parsed !== null
      chainId = parsed
    }
  }

  return {
    info,
    account,
    chainId,
    canRequest,
    canReadAccounts,
    canReadChain,
    isTrustWallet: isTrustWalletMetadata(info),
  }
}

export async function discoverInjectedWallets(timeoutMs = 350): Promise<InjectedWallet[]> {
  if (typeof window === 'undefined') return []
  console.info('[Wallet discovery] Discovery started')

  const announcements: Announcement[] = []
  const announcedProviders = new Set<Eip1193Provider>()
  const onAnnouncement = (event: Event) => {
    const announcement = (event as CustomEvent<Announcement>).detail
    if (!announcement?.provider) return
    announcements.push(announcement)
    announcedProviders.add(announcement.provider)
  }

  window.addEventListener('eip6963:announceProvider', onAnnouncement)
  window.dispatchEvent(new Event('eip6963:requestProvider'))
  await new Promise((resolve) => setTimeout(resolve, timeoutMs))
  window.removeEventListener('eip6963:announceProvider', onAnnouncement)

  const legacy = window.ethereum
  const legacyProviders = legacy?.providers?.length ? legacy.providers : legacy ? [legacy] : []
  const candidates = announcements.map((entry, index) => ({
    provider: entry.provider as Eip1193Provider,
    info: providerInfo(entry.provider as Eip1193Provider, index, entry.info),
  }))

  for (const [index, candidate] of legacyProviders.entries()) {
    if (announcedProviders.has(candidate)) continue
    candidates.push({ provider: candidate, info: providerInfo(candidate, index) })
  }

  const unique = new Map<string, typeof candidates[number]>()
  for (const candidate of candidates) {
    const key = candidate.info.uuid || candidate.info.rdns || `${candidate.info.name}-${unique.size}`
    if (!unique.has(key)) unique.set(key, candidate)
  }

  const wallets = await Promise.all(
    [...unique.values()].map(({ provider, info }) => inspectProvider(provider, info)),
  )
  console.info('[Wallet discovery] Providers detected', {
    count: wallets.length,
    providers: wallets.map(({ info, canRequest, canReadAccounts, canReadChain }) => ({
      name: info.name,
      rdns: info.rdns,
      canRequest,
      canReadAccounts,
      canReadChain,
    })),
  })
  return wallets
}

