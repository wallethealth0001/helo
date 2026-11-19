import { shortenAddress } from '../../utils/address'

export function WalletInformation({ wallet, onDisconnect }: { wallet: any; onDisconnect: () => void }) {
  return (
    <section className="card">
      <div className="card-heading">
        <div><span className="eyebrow">WALLET</span><h2>Connection</h2></div>
        <span className={wallet.account ? 'pill success' : 'pill'}>{wallet.account ? 'Connected' : 'Disconnected'}</span>
      </div>
      {wallet.account ? (
        <>
          <div className="address-row">
            <code>{shortenAddress(wallet.account)}</code>
            <button
              className="icon-button"
              aria-label="Copy wallet address"
              onClick={() => void navigator.clipboard.writeText(wallet.account)}
            >Copy</button>
          </div>
          <button className="text-button danger" onClick={onDisconnect}>Disconnect wallet</button>
        </>
      ) : <p className="muted">No wallet is connected.</p>}
    </section>
  )
}

