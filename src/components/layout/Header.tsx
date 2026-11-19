import { WalletConnectButton } from '../wallet/WalletConnectButton'

interface Props {
  connected: boolean
  address?: string
  onConnect: () => void
}

export function Header({ connected, address, onConnect }: Props) {
  return (
    <header className="topbar">
      <a className="brand" href="#" aria-label="BSC Wallet Center home">
        <span className="brand-mark">B</span>
        <span>BSC <b>Wallet</b></span>
      </a>
      <WalletConnectButton connected={connected} address={address} onClick={onConnect} />
    </header>
  )
}

