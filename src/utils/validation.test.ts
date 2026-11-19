import { describe, expect, it } from 'vitest'
import { validateApprovalInput } from './validation'

describe('approval validation', () => {
  const base = {
    token: '0x55d398326f794A0E5a5aD3A7D6b4f9C0dE2f4f3B',
    spender: '0x1111111111111111111111111111111111111111',
    account: '0x2222222222222222222222222222222222222222',
    chainId: 56,
    amount: 1000000000000000000n,
  }

  it('accepts valid approval parameters', () => {
    expect(() => validateApprovalInput(base)).not.toThrow()
  })

  it('rejects wrong networks', () => {
    expect(() => validateApprovalInput({ ...base, chainId: 1 })).toThrow('BNB Smart Chain')
  })

  it('rejects a spender equal to the token', () => {
    expect(() => validateApprovalInput({ ...base, spender: base.token })).toThrow('must be different')
  })
})
