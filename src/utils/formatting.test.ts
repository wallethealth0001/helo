import { describe, expect, it } from 'vitest'
import { parseTokenAmount, formatTokenAmount } from './formatting'

describe('token formatting', () => {
  it('parses a limited USDT allowance', () => {
    expect(parseTokenAmount('1.25', 18)).toBe(1250000000000000000n)
  })

  it('rejects invalid approval amounts', () => {
    expect(() => parseTokenAmount('', 18)).toThrow('Enter an approval amount')
    expect(() => parseTokenAmount('-1', 18)).toThrow('valid decimal')
  })

  it('formats token values without excess zeros', () => {
    expect(formatTokenAmount(1250000000000000000n, 18)).toBe('1.25')
  })
})
