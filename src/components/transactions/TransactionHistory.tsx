import type { TransactionItem } from '../../types/transactions'

export function TransactionHistory({ items, onCertificate }: { items: TransactionItem[]; onCertificate: (hash: string) => void }) {
  return (
    <section className="card history-card">
      <div className="card-heading"><div><span className="eyebrow">ACTIVITY</span><h2>Transaction history</h2></div></div>
      {items.length === 0 ? <p className="muted">No approval transactions in this session.</p> : (
        <div className="history-list">
          {items.map((item) => (
            <button key={item.hash} className="history-row" onClick={() => onCertificate(item.hash)}>
              <span className={`tx-status ${item.status}`}>{item.status}</span>
              <code>{item.hash.slice(0, 12)}...{item.hash.slice(-8)}</code>
              <time>{new Date(item.timestamp).toLocaleString()}</time>
              <span>›</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
