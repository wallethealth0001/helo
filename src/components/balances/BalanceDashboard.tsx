export function BalanceDashboard({ bnb, usdt, loading, onRefresh, connected }: {
  bnb: string
  usdt: string
  loading: boolean
  onRefresh: () => void
  connected: boolean
}) {
  return (
    <section className="card balance-card">
      <div className="card-heading">
        <div><span className="eyebrow">BALANCES</span><h2>Asset overview</h2></div>
        <button className="icon-button" onClick={onRefresh} disabled={loading || !connected}>
          {loading ? 'Reading...' : 'Refresh'}
        </button>
      </div>
      <div className="balance-grid">
        <div className="balance-item">
          <span className="coin-icon bnb">B</span>
          <div><small>BNB</small><strong>{bnb}</strong></div>
        </div>
        <div className="balance-item">
          <span className="coin-icon usdt">$</span>
          <div><small>USDT</small><strong>{usdt}</strong></div>
        </div>
      </div>
    </section>
  )
}
