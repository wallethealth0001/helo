export type WalletStatus =
  | 'idle'
  | 'initializing'
  | 'ready'
  | 'connecting'
  | 'waiting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'cancelled'

export interface WalletState {
  account: string | null
  chainId: number | null
  provider: unknown
  status: WalletStatus
  uri: string | null
  initializing: boolean
  switching: boolean
  error: string | null
}

