import type { InjectedWallet } from '../../types/injectedWallet'
import { BSC } from '../../config/chains'

export function WalletDiscoveryList({ wallets, loading }: { wallets: InjectedWallet[]; loading: boolean }) {
  return (
    <section className="discovered-wallets" aria-label="Injected wallets detected in this browser">
      <span className="eyebrow">BROWSER WALLETS</span>
      {loading ? <p className="muted">Checking for injected wallet providers…</p> : wallets.length === 0 ? (
        <p className="muted">No injected wallet provider detected. WalletConnect QR remains available.</p>
      ) : wallets.map((wallet) => (
        <div className="discovered-wallet" key={wallet.info.uuid}>
          {wallet.info.icon
            ? <img src={wallet.info.icon} alt="" />
            : <span className="option-icon walletconnect">W</span>}
          <div className="discovered-wallet-info">
            <b>{wallet.info.name}</b>
            <small>{wallet.info.rdns}{wallet.isTrustWallet ? ' · Trust Wallet provider metadata' : ''}</small>
            <small>
              {wallet.account ? 'Authorized account available' : wallet.canReadAccounts ? 'No authorized account' : 'Account access unavailable'}
              {' · '}
              {wallet.chainId === null ? 'Network unavailable' : wallet.chainId === BSC.id ? 'BNB Smart Chain' : `Chain ${wallet.chainId}`}
            </small>
          </div>
        </div>
      ))}
      <small className="discovery-disclaimer">
        Provider detection is not proof that a wallet app is installed or can be launched.
      </small>
    </section>
  )
}
