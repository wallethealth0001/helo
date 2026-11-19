import { QRCodeSVG } from 'qrcode.react'

interface Props {
  open: boolean
  onClose: () => void
  onWalletConnect: () => void
  onTrustWallet: () => void
  initializing: boolean
  uri: string | null
  trustWalletLink: string | null
  uriCopied: boolean
  error: string | null
  status: string
  onRetry: () => void
  onRetryTrust: () => void
  onCopyUri: () => void
  onCancel: () => void
}

export function WalletSelectionModal(props: Props) {
  if (!props.open) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) props.onClose()
    }}>
      <section className="modal-card wallet-modal" role="dialog" aria-modal="true" aria-labelledby="wallet-modal-title">
        <button className="modal-close" aria-label="Close" onClick={props.onClose}>×</button>
        <span className="eyebrow">WALLET CONNECTION</span>
        <h2 id="wallet-modal-title">Choose a wallet</h2>
        {props.status === 'connected' ? (
          <div className="progress-state">
            <h3>Wallet connected</h3>
            <p>Your BNB Smart Chain session is ready.</p>
            <button className="secondary-button" onClick={props.onClose}>Done</button>
          </div>
        ) : props.uri ? (
          <div className="qr-layout">
            <div className="qr-frame"><QRCodeSVG value={props.uri} size={220} level="M" /></div>
            <div>
              <h3>{props.status === 'connected' ? 'Connected' : 'Waiting for approval'}</h3>
              <p>Scan this code or open your mobile wallet. Keep this window open until approval completes.</p>
              {props.trustWalletLink && (
                <>
                  <p>If Trust Wallet does not open, launch it manually and scan this QR code or copy the pairing URI.</p>
                  <p><a href={props.trustWalletLink} target="_blank" rel="noreferrer">Open Trust Wallet</a></p>
                  <div className="modal-actions">
                    <button className="secondary-button" onClick={props.onCopyUri}>
                      {props.uriCopied ? 'URI copied' : 'Copy WalletConnect URI'}
                    </button>
                    <button className="secondary-button" onClick={props.onRetryTrust}>Retry Trust Wallet</button>
                  </div>
                </>
              )}
              {props.error && <p className="progress-text error-text">{props.error}</p>}
              {props.status === 'failed' && <button className="secondary-button" onClick={props.onRetry}>Retry connection</button>}
              <button className="secondary-button" onClick={props.onCancel}>Cancel connection</button>
            </div>
          </div>
        ) : props.initializing || props.status === 'initializing' || props.status === 'connecting' ? (
          <div className="wallet-options">
            <p className="progress-text">
              {props.initializing || props.status === 'initializing'
                ? 'Initializing WalletConnect...'
                : 'Requesting a secure WalletConnect pairing...'}
            </p>
            <button className="secondary-button" onClick={props.onCancel}>Cancel connection</button>
          </div>
        ) : (
          <div className="wallet-options">
            <button className="wallet-option" onClick={props.onWalletConnect}>
              <span className="option-icon walletconnect">W</span>
              <span><b>WalletConnect</b><small>Scan with any compatible wallet</small></span>
              <span>›</span>
            </button>
            <button className="wallet-option" onClick={props.onTrustWallet}>
              <span className="option-icon trust">T</span>
              <span><b>Trust Wallet</b><small>Open Trust Wallet on mobile</small></span>
              <span>›</span>
            </button>
          </div>
        )}
        {!props.uri && props.status === 'ready' && <p className="progress-text">WalletConnect is ready. Choose a wallet to continue.</p>}
        {!props.uri && props.status === 'cancelled' && <p className="progress-text">Connection cancelled. You can try again.</p>}
        {!props.uri && props.error && (
          <div className="progress-text error-text" role="alert">
            <p>{props.error}</p>
            <button className="secondary-button" onClick={props.onRetry}>Retry connection</button>
          </div>
        )}
      </section>
    </div>
  )
}

