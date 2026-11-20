import { useCallback, useEffect, useState } from 'react'
import { MainLayout } from './components/layout/MainLayout'
import { Header } from './components/layout/Header'
import { WalletSelectionModal } from './components/wallet/WalletSelectionModal'
import { WalletInformation } from './components/wallet/WalletInformation'
import { NetworkInformation } from './components/network/NetworkInformation'
import { BalanceDashboard } from './components/balances/BalanceDashboard'
import { ApprovalReviewModal } from './components/approval/ApprovalReviewModal'
import { ApprovalStatus } from './components/approval/ApprovalStatus'
import { GasInformation } from './components/approval/GasInformation'
import { TransactionHistory } from './components/transactions/TransactionHistory'
import { CertificateModal } from './components/certificate/CertificateModal'
import { ErrorModal } from './components/modals/ErrorModal'
import { useWallet } from './hooks/useWallet'
import { useBalances } from './hooks/useBalances'
import { useTransactions } from './hooks/useTransactions'
import { useAllowance } from './hooks/useAllowance'
import { useWalletDiscovery } from './hooks/useWalletDiscovery'
import { shortenAddress } from './utils/address'
import './styles/app.css'

export default function App() {
  const wallet = useWallet()
  const balances = useBalances(wallet.account, wallet.chainId)
  const transactions = useTransactions()
  const allowance = useAllowance(wallet.account, wallet.chainId)
  const walletDiscovery = useWalletDiscovery()
  const [walletModal, setWalletModal] = useState(false)
  const [approvalModal, setApprovalModal] = useState(false)
  const [certificateModal, setCertificateModal] = useState(false)
  const [approvalMode, setApprovalMode] = useState<'approval' | 'revoke'>('approval')
  const [error, setError] = useState<string | null>(null)
  const [checkAfterConnect, setCheckAfterConnect] = useState(false)
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)

  useEffect(() => {
    setError(wallet.error)
  }, [wallet.error])

  useEffect(() => {
    if (wallet.account) void allowance.refresh()
  }, [wallet.account, wallet.chainId])

  const onApprovalSubmitted = (hash: string) => {
    transactions.addPending(hash)
  }

  const executeCheck = useCallback(async () => {
    if (!wallet.account) return
    if (wallet.chainId !== 56) {
      setCheckError('Switch to BNB Smart Chain before checking this wallet.')
      return
    }
    setChecking(true)
    setCheckError(null)
    const result = await balances.refresh()
    setChecking(false)
    if ('error' in result) {
      setCheckError(result.error)
      return
    }
    transactions.selectHash(null)
    setCertificateModal(true)
  }, [wallet.account, wallet.chainId, balances.refresh, transactions.selectHash])

  const onCheckNow = () => {
    setCheckError(null)
    if (wallet.account) {
      void executeCheck()
      return
    }
    setCheckAfterConnect(true)
    setWalletModal(true)
  }

  useEffect(() => {
    if (!checkAfterConnect) return
    if (wallet.account) {
      setCheckAfterConnect(false)
      setWalletModal(false)
      void executeCheck()
    } else if (wallet.status === 'cancelled' || wallet.status === 'failed') {
      setCheckAfterConnect(false)
    }
  }, [checkAfterConnect, wallet.account, wallet.status, executeCheck])

  return (
    <MainLayout>
      <Header
        connected={Boolean(wallet.account)}
        address={wallet.account ? shortenAddress(wallet.account) : undefined}
        onConnect={() => setWalletModal(true)}
      />

      <main className="dashboard">
        <section className="hero-panel">
          <div>
            <span className="eyebrow">BSC WALLET CENTER</span>
            <h1>Control your wallet.<br />Review every allowance.</h1>
            <p>Connect, inspect balances, and authorize token approvals explicitly on BNB Smart Chain.</p>
            <button className="check-now-button" onClick={onCheckNow} disabled={checking}>
              {checking ? 'Checking balances…' : wallet.account ? 'Check now' : 'Connect & check now'}
            </button>
            <p className="check-disclaimer">Reads public BSC balances only. This is not a security audit; no approval or transfer is submitted.</p>
            {checkError && <p className="check-error" role="alert">{checkError}</p>}
          </div>
          <div className="hero-status">
            <span className={wallet.account ? 'status-dot live' : 'status-dot'} />
            {wallet.status === 'initializing' ? 'Initializing...' :
              wallet.status === 'connecting' ? 'Connecting...' :
                wallet.status === 'waiting' ? 'Waiting for wallet approval' :
                  wallet.status === 'failed' ? 'Connection failed' :
                    wallet.status === 'cancelled' ? 'Connection cancelled' :
                      wallet.account ? 'Wallet connected' : 'Wallet ready'}
          </div>
        </section>

        <div className="grid-layout">
          <div className="stack">
            <WalletInformation wallet={wallet} onDisconnect={() => void wallet.disconnect()} />
            <NetworkInformation
              chainId={wallet.chainId}
              switching={wallet.switching}
              onSwitch={() => void wallet.switchToBsc()}
            />
          </div>
          <div className="stack">
            <BalanceDashboard
              bnb={balances.bnb}
              usdt={balances.usdt}
              loading={balances.loading}
              onRefresh={() => void balances.refresh()}
              connected={Boolean(wallet.account)}
            />
            <GasInformation
              bnb={balances.bnb}
              transactionGas={allowance.estimatedGas}
              transactionFee={allowance.estimatedFee}
            />
          </div>
        </div>

        <section className="action-grid">
          <ApprovalStatus
            allowance={allowance}
            refresh={() => void allowance.refresh()}
            onRevoke={() => {
              setApprovalMode('revoke')
              setApprovalModal(true)
            }}
          />
          <div className="card action-card">
            <div>
              <span className="eyebrow">ALLOWANCE MANAGEMENT</span>
              <h2>USDT approval</h2>
              <p>Review the spender, exact amount, network, and consequences before signing.</p>
            </div>
            <button
              className="primary-button"
              disabled={!wallet.account}
              onClick={() => {
                setApprovalMode('approval')
                setApprovalModal(true)
              }}
            >
              Review approval
            </button>
          </div>
        </section>

        <TransactionHistory
          items={transactions.items}
          onCertificate={(hash) => {
            transactions.selectHash(hash)
            setCertificateModal(true)
          }}
        />
      </main>

      <WalletSelectionModal
        open={walletModal}
        onClose={() => {
          if (wallet.status === 'connecting' || wallet.status === 'waiting' || wallet.initializing) void wallet.cancel()
          setWalletModal(false)
        }}
        onWalletConnect={() => wallet.connectQr()}
        onTrustWallet={() => wallet.connectTrust()}
        initializing={wallet.initializing}
        uri={wallet.uri}
        trustWalletLink={wallet.trustWalletLink}
        uriCopied={wallet.uriCopied}
        error={wallet.error}
        status={wallet.status}
        onRetry={() => wallet.retry()}
        onRetryTrust={() => wallet.retryTrustWallet()}
        onCopyUri={() => void wallet.copyUri()}
        onCancel={() => void wallet.cancel()}
        injectedWallets={walletDiscovery.wallets}
        discoveringWallets={walletDiscovery.loading}
        trustLaunchStatus={wallet.trustLaunchStatus}
        onTrustLaunch={wallet.launchTrustWallet}
      />
      <ApprovalReviewModal
        open={approvalModal}
        onClose={() => setApprovalModal(false)}
        wallet={wallet}
        allowance={allowance}
        mode={approvalMode}
        onSubmitted={onApprovalSubmitted}
      />
      <CertificateModal
        open={certificateModal}
        onClose={() => setCertificateModal(false)}
        account={wallet.account}
        usdt={balances.usdt}
        approvalStatus={allowance.status}
        hash={transactions.selectedHash}
      />
      <ErrorModal
        error={walletModal ? null : error}
        onClose={() => setError(null)}
        onRetry={wallet.status === 'failed' ? () => {
          setError(null)
          setWalletModal(true)
          wallet.retry()
        } : undefined}
      />
    </MainLayout>
  )
}
