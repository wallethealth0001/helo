export function ErrorModal({ error, onClose, onRetry }: { error: string | null; onClose: () => void; onRetry?: () => void }) {
  if (!error) return null
  return (
    <div className="modal-backdrop">
      <section className="modal-card error-modal" role="alertdialog" aria-modal="true">
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        <span className="eyebrow">ACTION REQUIRED</span>
        <h2>Wallet error</h2>
        <p>{error}</p>
        <div className="modal-actions">
          {onRetry && <button className="primary-button" onClick={onRetry}>Retry connection</button>}
          <button className="secondary-button" onClick={onClose}>Dismiss</button>
        </div>
      </section>
    </div>
  )
}
