interface Props {
  connected: boolean
  address?: string
  onClick: () => void
}

export function WalletConnectButton({ connected, address, onClick }: Props) {
  return (
    <button className={connected ? 'wallet-button connected' : 'wallet-button'} onClick={onClick}>
      <span className="wallet-button-dot" />
      {connected ? address : 'check noww'}
    </button>
  )
}

