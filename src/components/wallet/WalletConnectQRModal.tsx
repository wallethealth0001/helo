import { QRCodeSVG } from 'qrcode.react'

export function WalletConnectQRModal({ uri, open, onCancel }: { uri: string; open: boolean; onCancel: () => void }) {
  if (!open) return null
  return (
    <div className="qr-layout">
      <div className="qr-frame"><QRCodeSVG value={uri} size={220} level="M" /></div>
      <div>
        <h3>Waiting for approval</h3>
        <p>Scan with WalletConnect or continue in your mobile wallet.</p>
        <button className="secondary-button" onClick={onCancel}>Cancel connection</button>
      </div>
    </div>
  )
}
