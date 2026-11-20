import { useCallback, useEffect, useState } from 'react'
import { getBNBBalance, getUSDTBalance, formatBNB } from '../services/balanceService'
import { transactionErrorMessage } from '../utils/transactionErrors'

export function useBalances(account: string | null, chainId: number | null) {
  const [bnbRaw, setBnbRaw] = useState<bigint>(0n)
  const [bnb, setBnb] = useState('0')
  const [usdt, setUsdt] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<{ bnb: string; usdt: string } | { error: string }> => {
    if (!account) return { error: 'Connect a wallet to read balances.' }
    setLoading(true)
    setError(null)
    try {
      const [bnbResult, usdtResult] = await Promise.all([
        getBNBBalance(account),
        getUSDTBalance(account),
      ])
      setBnbRaw(bnbResult)
      const formattedBnb = formatBNB(bnbResult)
      setBnb(formattedBnb)
      setUsdt(usdtResult.formatted)
      return { bnb: formattedBnb, usdt: usdtResult.formatted }
    } catch (caught) {
      const message = transactionErrorMessage(caught)
      setError(message)
      return { error: message }
    } finally {
      setLoading(false)
    }
  }, [account])

  useEffect(() => {
    if (account && chainId === 56) void refresh()
  }, [account, chainId, refresh])

  return { bnb, bnbRaw, usdt, loading, error, refresh }
}
