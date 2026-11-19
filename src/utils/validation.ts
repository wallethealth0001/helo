import { isAddress, sameAddress } from './address'

export function validateApprovalInput(params: {
  token: string
  spender: string
  account: string | null
  chainId: number | null
  amount: bigint
}) {
  if (!isAddress(params.token)) throw new Error('Invalid token contract address.')
  if (!isAddress(params.spender)) throw new Error('Invalid spender contract address.')
  if (!params.account || !isAddress(params.account)) throw new Error('Invalid connected account.')
  if (params.chainId !== 56) throw new Error('Switch to BNB Smart Chain before submitting.')
  if (sameAddress(params.token, params.spender)) throw new Error('Token and spender addresses must be different.')
  if (params.amount < 0n) throw new Error('Approval amount cannot be negative.')
}

