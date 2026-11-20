import { useEffect, useState } from 'react'
import { discoverInjectedWallets } from '../services/walletDiscoveryService'
import type { InjectedWallet } from '../types/injectedWallet'

export function useWalletDiscovery() {
  const [wallets, setWallets] = useState<InjectedWallet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void discoverInjectedWallets()
      .then((found) => {
        if (active) setWallets(found)
      })
      .catch((error: unknown) => {
        console.error('[Wallet discovery] Discovery failed', error instanceof Error ? error.message : 'Unknown error')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  return { wallets, loading }
}
