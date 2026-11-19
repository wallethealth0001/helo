
export function GasInformation({ bnb, transactionGas, transactionFee }: {
  bnb: string
  transactionGas: string
  transactionFee: string
}) {
  const sufficient = Number(bnb) > 0
  return (
    <section className="card">
      <div className="card-heading">
        <div><span className="eyebrow">GAS</span><h2>Transaction readiness</h2></div>
        <span className={sufficient ? 'pill success' : 'pill warning'}>{sufficient ? 'BNB available' : 'No BNB'}</span>
      </div>
      <dl className="detail-list">
        <div><dt>Current BNB</dt><dd>{bnb}</dd></div>
        <div><dt>Est. gas</dt><dd>{transactionGas}</dd></div>
        <div><dt>Est. fee</dt><dd>{transactionFee}</dd></div>
      </dl>
    </section>
  )
}
