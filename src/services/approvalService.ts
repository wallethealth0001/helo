import { Contract, formatEther, Interface, parseUnits, MaxUint256 } from 'ethers'
import { getReadProvider } from './blockchainService'
import { USDT_ADDRESS, USDT_DECIMALS_FALLBACK } from '../config/contracts'

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
]

export function getApprovalInterface() {
  return new Interface(ERC20_ABI)
}

export async function getTokenDetails() {
  const provider = getReadProvider()
  const token = new Contract(USDT_ADDRESS, ERC20_ABI, provider)
  const [name, decimals] = await Promise.all([
    token.name().catch(() => 'USDT'),
    token.decimals().catch(() => USDT_DECIMALS_FALLBACK),
  ])
  return { name: name as string, decimals: Number(decimals), contract: USDT_ADDRESS }
}

export async function getAllowance(tokenAddress: string, owner: string, spender: string): Promise<bigint> {
  if (!spender) throw new Error('Approval spender is not configured.')
  const provider = getReadProvider()
  const token = new Contract(tokenAddress, ERC20_ABI, provider)
  return token.allowance(owner, spender) as Promise<bigint>
}

export function encodeApproval(tokenAddress: string, spender: string, amount: bigint): string {
  if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) throw new Error('Invalid token contract address.')
  return getApprovalInterface().encodeFunctionData('approve', [spender, amount])
}

export function getUnlimitedAllowance(): bigint {
  return MaxUint256
}

export async function estimateApprovalGas(account: string, spender: string, decimals: number) {
  const provider = getReadProvider()
  const data = encodeApproval(USDT_ADDRESS, spender, parseUnits('1', decimals))
  const [gasLimit, feeData] = await Promise.all([
    provider.estimateGas({ from: account, to: USDT_ADDRESS, data, value: 0n }),
    provider.getFeeData(),
  ])
  const gasPrice = feeData.gasPrice ?? feeData.maxFeePerGas ?? 0n
  return {
    gasLimit: gasLimit.toString(),
    fee: formatEther(gasLimit * gasPrice),
  }
}
