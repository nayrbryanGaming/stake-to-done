import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther } from 'viem'
import confetti from 'canvas-confetti'
import { CheckCircle, Flame, ShieldCheck, Zap, Clock, Coins, Trophy, AlertCircle } from 'lucide-react'
import { STAKE_TO_DONE_ADDRESS, STAKE_TO_DONE_ABI } from '../constants'

const fmt = (s) => {
  if (s <= 0) return 'Expired'
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60), sec = s % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export const TaskItem = ({ id, initialTask, searchQuery, notify, refetchAll }) => {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending: txPending } = useWriteContract()
  const { isLoading: txCfm, isSuccess: txOk } = useWaitForTransactionReceipt({ hash })
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))
  const [fireworks, setFireworks] = useState(false)

  const { data: ft, refetch: rft } = useReadContract({
    address: STAKE_TO_DONE_ADDRESS, abi: STAKE_TO_DONE_ABI,
    functionName: 'tasks', args: [id], query: { enabled: !initialTask },
  })
  const task = initialTask ?? ft

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (txOk) { rft(); refetchAll(); notify('Transaction confirmed!') }
  }, [txOk])

  useEffect(() => {
    const done = task && (task.completed ?? task[5])
    if (done && !fireworks) {
      confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 }, colors: ['#6366f1','#a855f7','#fff'] })
      setFireworks(true)
    }
  }, [task, fireworks])

  if (!task) return null

  const tid  = task.id          ?? task[0]
  const desc = task.description ?? task[2]
  const amt  = task.stakeAmount  ?? task[3]
  const dl   = task.deadline    ?? task[4]
  const done = task.completed   ?? task[5]
  const clmd = task.claimed     ?? task[6]

  if (searchQuery && !String(desc).toLowerCase().includes(searchQuery.toLowerCase())) return null

  const expired = now >= Number(dl)
  const staked  = amt > 0n

  let sc = 'task-ready'
  if (done) sc = 'task-complete'
  else if (clmd) sc = 'task-expired'
  else if (staked) sc = 'task-active'

  const doAction = () => {
    if (txPending || txCfm) return
    if (!done && !clmd && !expired) {
      writeContract({ address: STAKE_TO_DONE_ADDRESS, abi: STAKE_TO_DONE_ABI, functionName: 'completeTask', args: [BigInt(tid)], gas: 130000n })
    }
  }

  const doClaim = () => {
    if (txPending || txCfm) return
    writeContract({ address: STAKE_TO_DONE_ADDRESS, abi: STAKE_TO_DONE_ABI, functionName: 'claimExpiredTask', args: [BigInt(tid)], gas: 120000n })
  }

  return (
    <motion.div layout initial={{ opacity:0, scale:.97 }} animate={{ opacity:1, scale:1 }} whileHover={{ y:-3 }}
      className={`card task-card ${sc}`}>
      <div className="task-header">
        <motion.div whileHover={{ rotate:360 }} transition={{ duration:.7 }}
          className={`icon-widget icon-widget-lg ${done?'icon-widget-success':clmd?'icon-widget-error':staked?'icon-widget-warning':'icon-widget-primary'}`}>
          {done?<CheckCircle/>:clmd?<Flame/>:staked?<ShieldCheck/>:<Zap/>}
        </motion.div>
        <div className="task-body">
          <div className="task-badges">
            <span className="badge badge-dim">#{String(tid)}</span>
            {done  && <span className="badge badge-success"><CheckCircle/>Completed</span>}
            {clmd  && <span className="badge badge-error"><Flame/>Treasury</span>}
            {!done&&!clmd&&staked && <span className="badge badge-warning"><ShieldCheck/>Staked</span>}
            {!done&&!clmd&&expired&&staked && <span className="badge badge-error"><AlertCircle/>Expired</span>}
          </div>
          <h3 className="task-title">{String(desc)}</h3>
          <div className="task-meta">
            <div className="task-meta-item">
              <div className="task-meta-icon" style={{color:'var(--primary)'}}><Clock/></div>
              <div>
                <div className="task-meta-label">Deadline</div>
                <div className="task-meta-value">{new Date(Number(dl)*1000).toLocaleString()}</div>
                <div className={`task-countdown ${expired?'expired':'live'}`}>{fmt(Number(dl)-now)}</div>
              </div>
            </div>
            <div className="task-meta-item">
              <div className="task-meta-icon" style={{color:'var(--warning)'}}><Coins/></div>
              <div>
                <div className="task-meta-label">Stake</div>
                <div className="task-meta-value">
                  {formatEther(amt)}{' '}
                  <span style={{fontSize:'.65rem',color:'var(--primary)',fontWeight:700}}>BASE SEPOLIA ETH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!done && !clmd && (
        <div className="task-actions">
          {staked ? (
            <>
              {!expired && (
                <motion.button className="btn btn-success btn-sm" whileHover={{scale:1.04}} whileTap={{scale:.96}}
                  onClick={doAction} disabled={txPending||txCfm}>
                  {txCfm?'Confirming…':txPending?'Submitting…':'Mark Complete'}<Trophy/>
                </motion.button>
              )}
              {expired && (
                <motion.button className="btn btn-danger btn-sm" whileHover={{scale:1.04}} whileTap={{scale:.96}}
                  onClick={doClaim} disabled={txPending||txCfm}>
                  {txPending?'Claiming…':'Claim Expired'}<Flame/>
                </motion.button>
              )}
            </>
          ) : (
             <span className="badge badge-error">Expired without stake</span>
          )}
        </div>
      )}
    </motion.div>
  )
}