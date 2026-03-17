import { Zap, ArrowRight } from 'lucide-react'
import { motion as Motion } from 'framer-motion'

export const TaskForm = ({
  description, setDescription,
  deadline, setDeadline,
  stakeAmount, setStakeAmount,
  onSubmit,
  isConnected,
  isTxPending, isAwaitingWalletApproval, isConfirming,
}) => {
  const btnLabel = () => {
    if (!isConnected)   return 'Connect Wallet First'
    if (isAwaitingWalletApproval) return 'Awaiting Wallet Approval...'
    if (isConfirming)   return 'Confirming…'
    if (isTxPending)    return 'Submitting…'
    return 'Create & Stake ETH'
  }

  return (
    <Motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card form-card"
    >
      <div className="form-card-header">
        <Motion.div
          className="icon-widget icon-widget-primary"
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
        >
          <Zap />
        </Motion.div>
        <h3 className="form-card-title">New Commitment</h3>
      </div>

      <form onSubmit={onSubmit} className="form-stack">
        <div className="form-group">
          <label className="form-label">Task Description</label>
          <input
            type="text" required className="form-input"
            placeholder="Finish the project report…"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Deadline</label>
          <input
            type="datetime-local" required className="form-input"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Stake Amount (Base Sepolia ETH)</label>
          <input
            type="number" required min="0.0001" step="0.0001"
            className="form-input" placeholder="0.001"
            value={stakeAmount}
            onChange={e => setStakeAmount(e.target.value)}
          />
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem' }}>
            Amount is in <strong>Base Sepolia testnet ETH</strong>.
          </p>
        </div>

        <Motion.button
          type="submit"
          className="btn btn-primary btn-lg btn-full"
          style={{ marginTop: '0.5rem' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isTxPending || isConfirming}
        >
          {btnLabel()} <ArrowRight />
        </Motion.button>
      </form>
    </Motion.div>
  )
}