import { formatUnits, parseUnits } from 'ethers'

export function formatTokenAmount(value: bigint, decimals: number, maxDecimals = 6): string {
  const formatted = formatUnits(value, decimals)
  const [whole, fraction] = formatted.split('.')
  if (!fraction) return whole
  return `${whole}.${fraction.slice(0, maxDecimals).replace(/0+$/, '')}`.replace(/\.$/, '')
}

export function parseTokenAmount(value: string, decimals: number): bigint {
  if (!value.trim()) throw new Error('Enter an approval amount.')
  if (!/^(?:\d+)(?:\.\d*)?$/.test(value.trim())) throw new Error('Enter a valid decimal amount.')
  return parseUnits(value.trim(), decimals)
}

