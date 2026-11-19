import { useState } from 'react'
import type { TransactionItem } from '../types/transactions'

export function useTransactions() {
  const [items, setItems] = useState<TransactionItem[]>([])
  const [selectedHash, setSelectedHash] = useState<string | null>(null)

  const addPending = (hash: string) => {
    setItems((current) => [
      { hash, status: 'pending', timestamp: Date.now(), kind: 'approval' },
      ...current,
    ])
  }

  const update = (hash: string, status: TransactionItem['status']) => {
    setItems((current) => current.map((item) => item.hash === hash ? { ...item, status } : item))
  }

  return { items, selectedHash, addPending, update, selectHash: setSelectedHash }
}
