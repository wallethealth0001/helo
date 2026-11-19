export function TransactionProgressModal({ open, status, hash, onClose }: {
  open: boolean
  status: 'pending' | 'success' | 'reverted' | 'rejected' | 'cancelled' | 'timeout'
  hash?: string
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="modal-backdrop">
      <section className="modal-card" role="dialog" aria-modal="true">
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        <h2>Transaction {status}</h2>
        {hash && <a href={`https://bscscan.com/tx/${hash}`} target="_blank" rel="noreferrer">{hash}</a>}
      </section>
    </div>
  )
}
