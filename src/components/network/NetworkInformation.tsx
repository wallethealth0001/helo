import { BSC } from '../../config/chains'

export function NetworkInformation({ chainId, switching, onSwitch }: {
  chainId: number | null
  switching: boolean
  onSwitch: () => void
}) {
  const correct = chainId === BSC.id
  return (
    <section className="card">
      <div className="card-heading">
        <div><span className="eyebrow">NETWORK</span><h2>{BSC.name}</h2></div>
        <span className={chainId === null ? 'pill' : correct ? 'pill success' : 'pill warning'}>
          {chainId === null ? 'Not detected' : correct ? 'Verified' : 'Mismatch'}
        </span>
      </div>
      <dl className="detail-list">
        <div><dt>Chain ID</dt><dd>{BSC.id} / {BSC.hexId}</dd></div>
        <div><dt>Currency</dt><dd>BNB</dd></div>
      </dl>
      {chainId !== null && !correct && (
        <button className="secondary-button" onClick={onSwitch} disabled={switching}>
          {switching ? 'Switching...' : 'Switch to BSC'}
        </button>
      )}
    </section>
  )
}
