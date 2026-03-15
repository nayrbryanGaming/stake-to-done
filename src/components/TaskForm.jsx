import { Zap, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { parseUnits } from 'viem'
import { USDC_DECIMALS } from '../constants'

export const TaskForm = ({
  description, setDescription,
  deadline, setDeadline,
  stakeAmount, setStakeAmount,
  onSubmit,
  isConnected,
  isTxPending, isConfirming,
  allowance,
}) => {
  let amountWei = 0n
  try { amountWei = parseUnits(stakeAmount || '0', USDC_DECIMALS) } catch {}
  const needsApproval = isConnected && (allowance ?? 0n) < amountWei && amountWei > 0n

  const btnLabel = () => {
    if (!isConnected)   return 'Connect Wallet First'
    if (isConfirming)   return 'Confirming…'
    if (isTxPending && needsApproval) return 'Approving Mock USDC…'
    if (isTxPending)    return 'Submitting…'
    if (needsApproval)  return 'Approve & Stake'
    return 'Create & Stake'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card form-card"
    >
      <div className="form-card-header">
        <motion.div
          className="icon-widget icon-widget-primary"
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
        >
          <Zap />
        </motion.div>
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
          <label className="form-label">Stake Amount (Mock USDC)</label>
          <input
            type="number" required min="0.01" step="0.01"
            className="form-input" placeholder="10.00"
            value={stakeAmount}
            onChange={e => setStakeAmount(e.target.value)}
          />
        </div>

        <motion.button
          type="submit"
          className="btn btn-primary btn-lg btn-full"
          style={{ marginTop: '0.5rem' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isTxPending || isConfirming}
        >
          {btnLabel()} <ArrowRight />
        </motion.button>
      </form>

      {needsApproval && !isTxPending && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: 'var(--warning)', fontWeight: 700 }}>
          ⚡ Two steps: first approve Mock USDC, then the task is created.
        </p>
      )}
    </motion.div>
  )
}