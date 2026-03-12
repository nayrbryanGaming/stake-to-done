import { useEffect, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt
} from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import confetti from 'canvas-confetti'
import {
  CheckCircle,
  Flame,
  ShieldCheck,
  Zap,
  Clock,
  Coins,
  Trophy
} from 'lucide-react'
import {
  STAKE_TO_DONE_ADDRESS,
  STAKE_TO_DONE_ABI,
  USDC_ADDRESS,
  USDC_ABI,
  USDC_DECIMALS
} from '../constants'

const formatCountdown = (seconds) => {
  if (seconds <= 0) return 'Expired'

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}

export const TaskItem = ({ id, initialTask, refetchAll, searchQuery, notify }) => {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending: isTxPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })
  const [stakeAmount, setStakeAmount] = useState('10')
  const [nowTs, setNowTs] = useState(Math.floor(Date.now() / 1000))
  const [confettiShown, setConfettiShown] = useState(false)

  const { data: fetchedTask, refetch: refetchTask } = useReadContract({
    address: STAKE_TO_DONE_ADDRESS,
    abi: STAKE_TO_DONE_ABI,
    functionName: 'tasks',
    args: [id],
    query: { enabled: !initialTask }
  })

  const task = initialTask || fetchedTask

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [address, STAKE_TO_DONE_ADDRESS],
    query: { enabled: !!address }
  })

  useEffect(() => {
    const timer = setInterval(() => setNowTs(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isConfirmed) {
      refetchTask()
      refetchAll()
      refetchAllowance()
      notify('Transaction confirmed')
    }
  }, [isConfirmed, refetchTask, refetchAll, refetchAllowance, notify])

  useEffect(() => {
    const isTaskCompleted = task && (typeof task === 'object' ? task.completed : task[5])
    if (isTaskCompleted && !confettiShown) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2dd4bf', '#f59e0b', '#ffffff']
      })
      setConfettiShown(true)
    }
  }, [task, confettiShown])

  if (!task) return null

  const taskId = typeof task === 'object' && !Array.isArray(task) ? task.id : task[0]
  const description = typeof task === 'object' && !Array.isArray(task) ? task.description : task[2]
  const amount = typeof task === 'object' && !Array.isArray(task) ? task.stakeAmount : task[3]
  const deadline = typeof task === 'object' && !Array.isArray(task) ? task.deadline : task[4]
  const completed = typeof task === 'object' && !Array.isArray(task) ? task.completed : task[5]
  const claimed = typeof task === 'object' && !Array.isArray(task) ? task.claimed : task[6]

  if (searchQuery && !description.toString().toLowerCase().includes(searchQuery.toLowerCase())) return null

  const isExpired = nowTs >= Number(deadline)
  const isStaked = amount > 0n
  const parsedStakeAmount = parseUnits(stakeAmount || '0', USDC_DECIMALS)
  const needsApproval = (allowance || 0n) < parsedStakeAmount
  const countdownLabel = formatCountdown(Number(deadline) - nowTs)

  const handleAction = () => {
    if (isTxPending || isConfirming) return

    if (!isStaked) {
      if (!stakeAmount || Number(stakeAmount) <= 0) {
        notify('Stake amount must be greater than zero')
        return
      }

      if (needsApproval) {
        writeContract({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [STAKE_TO_DONE_ADDRESS, parsedStakeAmount]
        })
        notify('Approval submitted')
      } else {
        writeContract({
          address: STAKE_TO_DONE_ADDRESS,
          abi: STAKE_TO_DONE_ABI,
          functionName: 'stakeTask',
          args: [BigInt(taskId), parsedStakeAmount]
        })
      }
      return
    }

    if (!completed && !claimed) {
      if (isExpired) {
        notify('Task is expired. Use claim to move funds to treasury.')
        return
      }

      writeContract({
        address: STAKE_TO_DONE_ADDRESS,
        abi: STAKE_TO_DONE_ABI,
        functionName: 'completeTask',
        args: [BigInt(taskId)]
      })
    }
  }

  const handleClaim = () => {
    if (isTxPending || isConfirming) return

    writeContract({
      address: STAKE_TO_DONE_ADDRESS,
      abi: STAKE_TO_DONE_ABI,
      functionName: 'claimExpiredTask',
      args: [BigInt(taskId)]
    })
  }

  const formattedAmount = isStaked ? formatUnits(amount, USDC_DECIMALS) : stakeAmount

  return (
    <Motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, borderColor: 'rgba(42, 157, 143, 0.4)' }}
      className={`glass-card p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-10 transition-all ${completed ? 'status-success' : claimed ? 'status-error' : isStaked ? 'status-warning' : 'status-dim'}`}
    >
      <div className="flex flex-col md:flex-row items-center gap-10 flex-1">
        <Motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.8 }}
          className="icon-widget w-16 h-16 sm:w-20 sm:h-20 bg-white/5 border-white/10 flex-shrink-0"
        >
          <Zap className={`w-8 h-8 sm:w-10 sm:h-10 ${completed ? 'text-success' : claimed ? 'text-error' : 'text-primary'}`} />
        </Motion.div>

        <div className="flex-1 text-left">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="status-badge status-dim font-outfit">TASK #{taskId.toString()}</span>
            {completed ? (
              <div className="status-badge status-success shadow-success">
                <CheckCircle className="w-4 h-4" /> Completed
              </div>
            ) : claimed ? (
              <div className="status-badge status-error shadow-error">
                <Flame className="w-4 h-4" /> Sent to treasury
              </div>
            ) : isStaked ? (
              <div className="status-badge status-warning shadow-warning">
                <ShieldCheck className="w-4 h-4" /> Staked
              </div>
            ) : (
              <div className="status-badge status-dim shadow-premium font-outfit">
                <Zap className="w-4 h-4" /> Waiting for stake
              </div>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white mb-4 tracking-tight uppercase leading-tight font-outfit">{description}</h3>

          <div className="flex flex-wrap items-center gap-10">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="label-mini mb-1 font-outfit text-[10px]">Deadline</div>
                <div className="text-sm font-bold text-white font-outfit">{new Date(Number(deadline) * 1000).toLocaleString()}</div>
                <div className={`text-[10px] uppercase tracking-widest mt-1 ${isExpired ? 'text-error' : 'text-primary'}`}>{countdownLabel}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 border border-white/5">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <div className="label-mini mb-1 font-outfit text-[10px]">Stake</div>
                <div className="text-base font-black text-white font-outfit">
                  {formattedAmount} <span className="text-[10px] text-gradient">USDC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 relative-z-10">
        {!completed && !claimed && (
          <>
            {isStaked ? (
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAction}
                disabled={isTxPending || isConfirming || isExpired}
                className="h-12 px-8 bg-emerald-600 hover:bg-emerald-500 btn-primary shadow-success text-xs"
              >
                {isConfirming ? 'Confirming...' : isTxPending ? 'Submitting...' : 'Complete task'} <Trophy className="w-4 h-4 ml-2" />
              </Motion.button>
            ) : (
              <div className="flex items-center glass-card p-2 rounded-2xl shadow-premium bg-white/5">
                <div className="px-6 flex flex-col">
                  <span className="label-mini text-[8px]">Amount</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-20 bg-transparent text-lg font-black outline-none text-indigo-400"
                  />
                </div>
                <Motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAction}
                  disabled={isTxPending || isConfirming || isExpired}
                  className="h-10 px-6 btn-primary text-[10px]"
                >
                  {isExpired ? 'Expired' : (needsApproval ? 'Approve' : 'Stake')}
                </Motion.button>
              </div>
            )}

            {isExpired && isStaked && (
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClaim}
                disabled={isTxPending || isConfirming}
                className="h-12 px-6 rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all text-xs font-black uppercase tracking-wider"
              >
                Claim expired
              </Motion.button>
            )}
          </>
        )}
      </div>
    </Motion.div>
  )
}
