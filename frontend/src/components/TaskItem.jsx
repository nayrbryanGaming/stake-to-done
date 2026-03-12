import { useState, useEffect } from 'react'
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
  Trophy,
  Bell
} from 'lucide-react'
import {
  STAKE_TO_DONE_ADDRESS,
  STAKE_TO_DONE_ABI,
  MOCK_USDC_ADDRESS,
  MOCK_USDC_ABI
} from '../constants'

export const TaskItem = ({ id, initialTask, refetchAll, searchQuery, notify }) => {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending: isTxPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const [stakeAmount, setStakeAmount] = useState('10')

  const { data: fetchedTask, refetch: refetchTask } = useReadContract({
    address: STAKE_TO_DONE_ADDRESS,
    abi: STAKE_TO_DONE_ABI,
    functionName: 'tasks',
    args: [id],
    query: { enabled: !initialTask }
  })

  const task = initialTask || fetchedTask

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: MOCK_USDC_ADDRESS,
    abi: MOCK_USDC_ABI,
    functionName: 'allowance',
    args: [address, STAKE_TO_DONE_ADDRESS],
    query: { enabled: !!address }
  })

  useEffect(() => {
    if (isConfirmed) {
      refetchTask()
      refetchAll()
      refetchAllowance()
      notify('Onchain Transaction Confirmed')
    }
  }, [isConfirmed, refetchTask, refetchAll, refetchAllowance, notify])

  const [confettiShown, setConfettiShown] = useState(false)
  useEffect(() => {
    const isTaskCompleted = task && (typeof task === 'object' ? task.completed : task[5])
    if (isTaskCompleted && !confettiShown) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ffffff']
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

  const isExpired = Number(deadline) < Math.floor(Date.now() / 1000)
  const isStaked = amount > 0n
  const needsApproval = (allowance || 0n) < parseUnits(stakeAmount || '0', 18)

  const handleAction = () => {
    if (isTxPending || isConfirming) return
    if (!isStaked) {
      const parsedAmount = parseUnits(stakeAmount, 18)
      if (needsApproval) {
        writeContract({ address: MOCK_USDC_ADDRESS, abi: MOCK_USDC_ABI, functionName: 'approve', args: [STAKE_TO_DONE_ADDRESS, parsedAmount] })
      } else {
        writeContract({ address: STAKE_TO_DONE_ADDRESS, abi: STAKE_TO_DONE_ABI, functionName: 'stakeTask', args: [BigInt(taskId), parsedAmount] })
      }
    } else if (!completed && !claimed) {
      writeContract({ address: STAKE_TO_DONE_ADDRESS, abi: STAKE_TO_DONE_ABI, functionName: 'completeTask', args: [BigInt(taskId)] })
    }
  }

  const handleClaim = () => {
    if (isTxPending || isConfirming) return
    writeContract({ address: STAKE_TO_DONE_ADDRESS, abi: STAKE_TO_DONE_ABI, functionName: 'claimExpiredTask', args: [BigInt(taskId)] })
  }

  const formattedAmount = isStaked ? formatUnits(amount, 18) : stakeAmount;
  
  return (
    <div className={`glass-card p-8 items-center gap-10 hover:border-primary animation-pulse-slow ${completed ? 'status-success' : claimed ? 'status-error' : isStaked ? 'status-warning' : 'status-dim'}`}>
      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="icon-widget w-20 h-20 bg-white/5 border-white/10 flex-shrink-0 animate-bounce-slow">
          <Zap className={`w-10 h-10 ${completed ? 'text-success' : claimed ? 'text-error' : 'text-primary'}`} />
        </div>
        <div className="flex-1 text-left">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="status-badge status-dim font-outfit">PROTOCOL ID #{taskId.toString()}</span>
          {completed ? (
            <div className="status-badge status-success shadow-success">
              <CheckCircle className="w-4 h-4" /> SUCCESS • FUNDS RECLAIMED
            </div>
          ) : claimed ? (
            <div className="status-badge status-error shadow-error">
              <Flame className="w-4 h-4" /> FAILURE • ASSETS BURNED
            </div>
          ) : isStaked ? (
            <div className="status-badge status-warning shadow-warning">
              <ShieldCheck className="w-4 h-4 animate-pulse" /> ACTIVE RESOLVE • LOCKED
            </div>
          ) : (
            <div className="status-badge status-dim shadow-premium font-outfit">
              <Zap className="w-4 h-4" /> INITIATED • AWAITING STAKE
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
              <div className="label-mini mb-2 font-outfit text-xs">Resolution Horizon</div>
              <div className="text-base font-black text-white font-outfit">{new Date(Number(deadline) * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 border border-white/5">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="label-mini mb-2 font-outfit text-xs">Staked liquidity</div>
              <div className="text-lg font-black text-white font-outfit">
                {formattedAmount} <span className="text-xs text-gradient">USDC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 relative-z-10">
        {!completed && !claimed && (
          <>
            {isStaked ? (
              <button 
                onClick={handleAction} 
                disabled={isTxPending || isConfirming || isExpired} 
                className="h-12 px-8 bg-emerald-600 hover:bg-emerald-500 btn-primary shadow-success text-xs"
              >
                {isConfirming ? 'VERIFYING...' : isTxPending ? 'SENDING...' : 'RECLAIM ASSETS'} <Trophy className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <div className="flex items-center glass-card p-2 rounded-2xl shadow-premium">
                <div className="px-6 flex flex-col">
                  <span className="label-mini">Amount</span>
                  <input 
                    type="number" 
                    value={stakeAmount} 
                    onChange={(e) => setStakeAmount(e.target.value)} 
                    className="w-20 bg-transparent text-xl font-black outline-none text-indigo-400" 
                  />
                </div>
                <button 
                  onClick={handleAction} 
                  disabled={isTxPending || isConfirming || isExpired} 
                  className="h-10 px-6 btn-primary text-xs"
                >
                  {isExpired ? 'DEADLINE PASSED' : (needsApproval ? 'AUTHORIZE' : 'LOCK STAKE')}
                </button>
              </div>
            )}
            {isExpired && isStaked && (
              <button 
                onClick={handleClaim} 
                disabled={isTxPending || isConfirming} 
                className="h-12 w-12 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all animate-pulse"
                title="Protocol Burn"
              >
                <Flame className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  </div>
)
}
