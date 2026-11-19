import { useEffect, useState } from 'react'
import { estimateApprovalGas, getAllowance, getTokenDetails } from '../services/approvalService'
import { APPROVAL_SPENDER_ADDRESS, USDT_ADDRESS } from '../config/contracts'
import { formatUnits } from 'ethers'
import type { ApprovalStatus } from '../types/approval'

export function useAllowance(account: string | null, chainId: number | null) {
  const [allowance, setAllowance] = useState<bigint>(0n)
  const [status, setStatus] = useState<ApprovalStatus>('not-approved')
  const [decimals, setDecimals] = useState(18)
  const [tokenName, setTokenName] = useState('USDT')
  const [estimatedGas, setEstimatedGas] = useState('Wallet estimate')
  const [estimatedFee, setEstimatedFee] = useState('Wallet estimate')

  const refresh = async () => {
    if (!account || chainId !== 56 || !APPROVAL_SPENDER_ADDRESS) return
    const [details, value] = await Promise.all([
      getTokenDetails(),
      getAllowance(USDT_ADDRESS, account, APPROVAL_SPENDER_ADDRESS),
    ])
    setDecimals(details.decimals)
    setTokenName(details.name)
    setAllowance(value)
    setStatus(value > 0n ? 'confirmed' : 'not-approved')
    try {
      const estimate = await estimateApprovalGas(account, APPROVAL_SPENDER_ADDRESS, details.decimals)
      setEstimatedGas(estimate.gasLimit)
      setEstimatedFee(estimate.fee)
    } catch {
      setEstimatedGas('Unavailable')
      setEstimatedFee('Unavailable')
    }
  }

  useEffect(() => {
    if (account && chainId === 56) void refresh()
  }, [account, chainId])

  return {
    allowance, allowanceText: formatUnits(allowance, decimals),
    status, decimals, tokenName, estimatedGas, estimatedFee,
    setStatus, refresh,
  }
}
