import { Contract, formatEther, formatUnits } from 'ethers'
import { getReadProvider } from './blockchainService'
import { USDT_ADDRESS } from '../config/contracts'

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
]

export async function getBNBBalance(address: string): Promise<bigint> {
  const provider = getReadProvider()
  return provider.getBalance(address)
}

export async function getUSDTBalance(address: string): Promise<{ raw: bigint; formatted: string; decimals: number }> {
  const provider = getReadProvider()
  const token = new Contract(USDT_ADDRESS, ERC20_ABI, provider)
  const [raw, decimals] = await Promise.all([
    token.balanceOf(address) as Promise<bigint>,
    token.decimals() as Promise<bigint>,
  ])
  const decimalCount = Number(decimals)
  return { raw, formatted: formatUnits(raw, decimalCount), decimals: decimalCount }
}

export function formatBNB(raw: bigint): string {
  return formatEther(raw)
}
