import { useEffect, useMemo, useState } from 'react'
import { APPROVAL_SPENDER_ADDRESS, USDT_ADDRESS, USDT_NAME } from '../../config/contracts'
import { BSC } from '../../config/chains'
import { encodeApproval, getUnlimitedAllowance } from '../../services/approvalService'
import { getAllowance } from '../../services/approvalService'
import { transactionService } from '../../services/transactionService'
import { validateApprovalInput } from '../../utils/validation'
import { formatTokenAmount, parseTokenAmount } from '../../utils/formatting'
import { transactionErrorMessage } from '../../utils/transactionErrors'

export function ApprovalReviewModal({ open, onClose, wallet, allowance, onSubmitted, mode = 'approval' }: {
  open: boolean
  onClose: () => void
  wallet: any
  allowance: any
  onSubmitted: (hash: string) => void
  mode?: 'approval' | 'revoke'
}) {
  const [amount, setAmount] = useState(mode === 'revoke' ? '0' : '50')
  const [unlimited, setUnlimited] = useState(false)
  const [stage, setStage] = useState<'review' | 'confirming' | 'tracking' | 'success' | 'error'>('review')
  const [message, setMessage] = useState('')
  const [hash, setHash] = useState<string | null>(null)

  useEffect(() => {
    setAmount(mode === 'revoke' ? '0' : '50')
    setUnlimited(false)
    setStage('review')
  }, [mode, open])

  const parsedAmount = useMemo(() => {
    try {
      return unlimited ? getUnlimitedAllowance() : parseTokenAmount(amount, allowance.decimals)
    } catch {
      return 0n
    }
  }, [amount, unlimited, allowance.decimals])

  if (!open) return null

  const submit = async () => {
    setStage('confirming')
    setMessage('')
    try {
      const requested = unlimited ? getUnlimitedAllowance() : parseTokenAmount(amount, allowance.decimals)
      validateApprovalInput({
        token: USDT_ADDRESS,
        spender: APPROVAL_SPENDER_ADDRESS,
        account: wallet.account,
        chainId: wallet.chainId,
        amount: requested,
      })
      allowance.setStatus('awaiting')
      const data = encodeApproval(USDT_ADDRESS, APPROVAL_SPENDER_ADDRESS, requested)
      const submittedAccount = wallet.account
      const result = await transactionService.sendApproval(wallet.account, USDT_ADDRESS, APPROVAL_SPENDER_ADDRESS, data)
      setHash(result)
      onSubmitted(result)
      setStage('tracking')
      const receipt = await transactionService.waitForReceipt(result)
      if (receipt === 'reverted') {
        allowance.setStatus('failed')
        setStage('error')
        setMessage('The approval transaction reverted. No verified allowance change is assumed.')
        return
      }
      if (receipt === 'timeout') {
        allowance.setStatus('expired')
        setStage('error')
        setMessage('Receipt confirmation timed out. The allowance remains unverified.')
        return
      }
      if (wallet.account && submittedAccount && wallet.account.toLowerCase() !== submittedAccount.toLowerCase()) {
        allowance.setStatus('failed')
        setStage('error')
        setMessage('The connected account changed during the transaction. The allowance result is not verified for the original account.')
        return
      }
      const verified = await getAllowance(USDT_ADDRESS, wallet.account, APPROVAL_SPENDER_ADDRESS)
      if (verified !== requested) {
        if (unlimited) {
          if (verified <= 0n) {
            allowance.setStatus('failed')
          }
        } else if (verified < requested) {
          allowance.setStatus('failed')
        }
        setStage('error')
        setMessage('The receipt succeeded, but the resulting allowance does not match the requested amount.')
        await allowance.refresh()
        return
      }
      allowance.setStatus('confirmed')
      await allowance.refresh()
      setStage('success')
    } catch (caught: any) {
      if (caught?.code === 4001) allowance.setStatus('rejected')
      else allowance.setStatus('failed')
      setStage('error')
      setMessage(transactionErrorMessage(caught))
    }
  }

  const exactAmount = unlimited ? 'Unlimited (MaxUint256)' : formatTokenAmount(parsedAmount, allowance.decimals)

  return (
    <div className="modal-backdrop">
      <section className="modal-card approval-modal" role="dialog" aria-modal="true" aria-labelledby="approval-title">
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        <span className="eyebrow">EXPLICIT TOKEN APPROVAL</span>
        <h2 id="approval-title">Review approval</h2>
        {stage === 'review' && (
          <>
            <dl className="review-list">
              <div><dt>Token</dt><dd>{USDT_NAME}</dd></div>
              <div><dt>Token contract</dt><dd><code>{USDT_ADDRESS}</code></dd></div>
              <div><dt>Connected wallet</dt><dd><code>{wallet.account ?? 'Not connected'}</code></dd></div>
              <div><dt>Spender contract</dt><dd><code>{APPROVAL_SPENDER_ADDRESS || 'NOT CONFIGURED'}</code></dd></div>
              <div><dt>Network</dt><dd>{BSC.name} ({BSC.id})</dd></div>
              <div><dt>Token decimals</dt><dd>{allowance.decimals}</dd></div>
              <div><dt>Existing allowance</dt><dd>{allowance.allowanceText}</dd></div>
              <div><dt>New allowance</dt><dd><b>{exactAmount}</b></dd></div>
            </dl>
            <label className="field-label">
              Approval amount
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                disabled={unlimited}
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>
            <label className="checkbox-row danger-check">
              <input type="checkbox" checked={unlimited} onChange={(event) => setUnlimited(event.target.checked)} />
              <span><b>Unlimited approval</b><small>This lets the configured spender use the token allowance until revoked. It carries higher risk.</small></span>
            </label>
            {!APPROVAL_SPENDER_ADDRESS && <p className="error-text">A verified spender address must be configured before approval can continue.</p>}
            <p className="consequence">Consequences: the spender contract may transfer approved USDT up to this allowance. You can revoke by approving zero explicitly.</p>
            <div className="modal-actions">
              <button className="secondary-button" onClick={onClose}>Cancel</button>
              <button
                className="primary-button"
                disabled={!wallet.account || wallet.chainId !== 56 || !APPROVAL_SPENDER_ADDRESS || (!unlimited && !amount)}
                onClick={() => void submit()}
              >Confirm in wallet</button>
            </div>
          </>
        )}
        {stage === 'confirming' && (
          <div className="progress-state"><span className="spinner" /><h3>Awaiting wallet confirmation</h3><p>Approve or reject the transaction in your wallet.</p></div>
        )}
        {stage === 'tracking' && (
          <div className="progress-state"><span className="spinner" /><h3>Tracking transaction</h3><p>Waiting for an on-chain receipt. A hash alone does not mean success.</p>{hash && <a href={transactionService.getExplorerUrl(hash)} target="_blank" rel="noreferrer">{hash}</a>}</div>
        )}
        {stage === 'success' && (
          <div className="progress-state success-state"><h3>Approval confirmed</h3><p>The on-chain receipt succeeded and the allowance was verified.</p>{hash && <a href={transactionService.getExplorerUrl(hash)} target="_blank" rel="noreferrer">View transaction</a>}<button className="primary-button" onClick={onClose}>Done</button></div>
        )}
        {stage === 'error' && (
          <div className="progress-state error-state"><h3>Approval unsuccessful</h3><p>{message}</p>{hash && <a href={transactionService.getExplorerUrl(hash)} target="_blank" rel="noreferrer">View transaction</a>}<button className="secondary-button" onClick={() => setStage('review')}>Review again</button></div>
        )}
      </section>
    </div>
  )
}
