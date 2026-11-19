import { describe, expect, it } from 'vitest'
import { BSC } from './chains'
import { APPROVAL_SPENDER_ADDRESS, USDT_ADDRESS } from './contracts'

describe('source-derived BSC configuration', () => {
  it('uses BNB Smart Chain mainnet', () => {
    expect(BSC.id).toBe(56)
    expect(BSC.hexId).toBe('0x38')
    expect(BSC.rpcUrls[0]).toBe('https://bsc-dataseed1.binance.org/')
  })

  it('preserves the source USDT and spender addresses', () => {
    expect(USDT_ADDRESS).toBe('0x55d398326f99059fF775485246999027B3197955')
    expect(APPROVAL_SPENDER_ADDRESS).toBe('0xc387226df446B7b508a5a90203FA1549F9B9947D')
  })
})
