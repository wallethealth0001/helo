export function transactionErrorMessage(error: unknown): string {
  const anyError = error as { code?: number | string; message?: string; shortMessage?: string }
  const text = `${anyError?.shortMessage ?? ''} ${anyError?.message ?? ''}`.toLowerCase()
  if (anyError?.code === 4001 || text.includes('user rejected') || text.includes('user denied')) {
    return 'The request was rejected in your wallet. No transaction was submitted.'
  }
  if (text.includes('underpriced')) return 'The transaction fee was underpriced. Increase the gas fee and retry.'
  if (text.includes('insufficient funds')) return 'Insufficient BNB is available to pay the transaction fee.'
  if (text.includes('session')) return 'The wallet session expired. Reconnect and try again.'
  if (text.includes('timeout') || text.includes('timed out')) return 'The RPC request timed out. Please retry.'
  if (text.includes('revert')) return 'The transaction reverted. Review the allowance and network, then retry.'
  return anyError?.shortMessage || anyError?.message || 'An unexpected wallet or network error occurred.'
}
