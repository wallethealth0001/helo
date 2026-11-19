export function ApprovalStatus({ allowance, refresh, onRevoke }: { allowance: any; refresh: () => void; onRevoke: () => void }) {
  const labels: Record<string, string> = {
    'not-approved': 'Not approved',
    awaiting: 'Awaiting confirmation',
    confirmed: 'Approval confirmed',
    failed: 'Approval failed',
    rejected: 'Approval rejected',
    expired: 'Session expired or unavailable',
  }
  return (
    <section className="card status-card">
      <div>
        <span className="eyebrow">APPROVAL STATUS</span>
        <h2>{labels[allowance.status] ?? 'Not approved'}</h2>
        <p>Current allowance: {allowance.allowanceText}</p>
      </div>
      <div className="status-actions">
        <button className="secondary-button" onClick={refresh}>Refresh allowance</button>
        <button className="text-button danger" onClick={onRevoke}>Set allowance to zero</button>
      </div>
    </section>
  )
}
