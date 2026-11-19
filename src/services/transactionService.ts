import { getReadProvider } from './blockchainService'
import { walletConnectService } from './walletConnectService'

export type ReceiptStatus = 'success' | 'reverted' | 'timeout'

export const transactionService = {
  async sendApproval(account: string, token: string, _spender: string, data: string) {
    return walletConnectService.requestTransaction(account, token, data)
  },

  async waitForReceipt(hash: string, timeoutMs = 90_000): Promise<ReceiptStatus> {
    const provider = getReadProvider()
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<'timeout'>((resolve) => {
      timer = setTimeout(() => resolve('timeout'), timeoutMs)
    })
    const receiptPromise = provider.waitForTransaction(hash, 1, timeoutMs).then((receipt) => {
      if (!receipt) return 'timeout' as const
      return receipt.status === 1 ? ('success' as const) : ('reverted' as const)
    })
    const result = await Promise.race([receiptPromise, timeout])
    if (timer) clearTimeout(timer)
    return result
  },

  getExplorerUrl(hash: string) {
    return `https://bscscan.com/tx/${hash}`
  },
}
