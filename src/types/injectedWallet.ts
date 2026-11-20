export interface InjectedProviderInfo {
  uuid: string
  name: string
  icon?: string
  rdns: string
}

export interface InjectedWallet {
  info: InjectedProviderInfo
  account: string | null
  chainId: number | null
  canRequest: boolean
  canReadAccounts: boolean
  canReadChain: boolean
  isTrustWallet: boolean
}
