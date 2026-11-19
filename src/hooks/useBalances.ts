import { useCallback, useEffect, useState } from 'react'
import { getBNBBalance, getUSDTBalance, formatBNB } from '../services/balanceService'
import { transactionErrorMessage } from '../utils/transactionErrors'

export function useBalances(account: string | null, chainId: number | null) {
  const [bnbRaw, setBnbRaw] = useState<bigint>(0n)
  const [bnb, setBnb] = useState('0')
  const [usdt, setUsdt] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!account) return
    setLoading(true)
    setError(null)
    try {
      const [bnbResult, usdtResult] = await Promise.all([
        getBNBBalance(account),
        getUSDTBalance(account),
      ])
      setBnbRaw(bnbResult)
      setBnb(formatBNB(bnbResult))
      setUsdt(usdtResult.formatted)
    } catch (caught) {
      setError(transactionErrorMessage(caught))
    } finally {
      setLoading(false)
    }
  }, [account])

  useEffect(() => {
    if (account && chainId === 56) void refresh()
  }, [account, chainId, refresh])

  return { bnb, bnbRaw, usdt, loading, error, refresh }
}
