export type TransactionStatus = 'pending' | 'success' | 'reverted' | 'rejected' | 'cancelled' | 'timeout'

export interface TransactionItem {
  hash: string
  status: TransactionStatus
  timestamp: number
  kind: 'approval'
}

