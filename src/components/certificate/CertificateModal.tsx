import { shortenAddress } from '../../utils/address'

export function CertificateModal({ open, onClose, account, usdt, approvalStatus, hash }: {
  open: boolean
  onClose: () => void
  account: string | null
  usdt: string
  approvalStatus: string
  hash: string | null
}) {
  if (!open) return null
  const reference = `UI-${Date.now().toString(36).toUpperCase()}`
  return (
    <div className="modal-backdrop">
      <section className="modal-card certificate-modal" role="dialog" aria-modal="true">
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        <span className="eyebrow">UI REFERENCE RECORD</span>
        <h2>Wallet status certificate</h2>
        <p className="certificate-note">This browser reference is not an independently verifiable blockchain certificate.</p>
        <dl className="review-list">
          <div><dt>Wallet</dt><dd>{account ? shortenAddress(account) : 'Disconnected'}</dd></div>
          <div><dt>Verified USDT balance</dt><dd>{usdt}</dd></div>
          <div><dt>Approval status</dt><dd>{approvalStatus}</dd></div>
          <div><dt>Transaction</dt><dd>{hash ?? 'No transaction selected'}</dd></div>
          <div><dt>Date</dt><dd>{new Date().toLocaleString()}</dd></div>
          <div><dt>UI reference</dt><dd>{reference}</dd></div>
        </dl>
      </section>
    </div>
  )
}
