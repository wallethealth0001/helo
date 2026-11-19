interface Props {
  onConnect: () => void
  disabled?: boolean
}

export function TrustWalletConnect({ onConnect, disabled }: Props) {
  return (
    <button className="wallet-option" onClick={onConnect} disabled={disabled}>
      <span className="option-icon trust">T</span>
      <span><b>Trust Wallet</b><small>Open Trust Wallet on mobile</small></span>
      <span>›</span>
    </button>
  )
}
