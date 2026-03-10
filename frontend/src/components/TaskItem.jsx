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

export const TaskItem = ({ id, refetchAll, searchQuery, notify }) => {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending: isTxPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const [stakeAmount, setStakeAmount] = useState('10')

  const { data: task, refetch: refetchTask } = useReadContract({
    address: STAKE_TO_DONE_ADDRESS,
    abi: STAKE_TO_DONE_ABI,
    functionName: 'tasks',
    args: [id]
  })

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

  return (
    <div className={`glass-card p-8 flex flex-col md:flex-row items-stretch md:items-center gap-8 group transition-all duration-500 overflow-hidden relative ${completed ? 'border-l-4 border-l-emerald-500 bg-emerald-500/[0.02]' : claimed ? 'border-l-4 border-l-red-500 bg-red-500/[0.02]' : isStaked ? 'border-l-4 border-l-amber-500 bg-amber-500/[0.02]' : 'border-l-4 border-l-indigo-500 bg-indigo-500/[0.02]'}`}>
      <div className="flex-1 relative z-10 text-left">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-500">ID #{taskId.toString()}</span>
          {completed ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <CheckCircle className="w-3.5 h-3.5" /> Mission Verified
            </div>
          ) : claimed ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-black uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5" /> Burned
            </div>
          ) : isStaked ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 animate-pulse" /> Active Resolve
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5" /> Pending Stake
            </div>
          )}
        </div>
        <h3 className="text-3xl font-black text-white mb-4 tracking-tight group-hover:text-indigo-400 transition-colors uppercase font-heading">{description}</h3>
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-indigo-500" />
            <div>
              <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Deadline</div>
              <div className="text-xs font-bold text-gray-400">{new Date(Number(deadline) * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Coins className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Asset</div>
              <div className="text-xs font-bold text-gray-200">{isStaked ? formatUnits(amount, 18) : stakeAmount} <span className="text-[10px] font-black text-gray-600 ml-1">USDC</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-stretch md:items-center gap-4 w-full md:w-auto relative z-10">
        {!completed && !claimed && (
          <>
            {isStaked ? (
              <button onClick={handleAction} disabled={isTxPending || isConfirming || isExpired} className="h-16 px-8 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl disabled:opacity-30">
                {isConfirming ? '...' : isTxPending ? '...' : 'Settle'} <Trophy className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center glass-card bg-black/40 border-white/10 p-1 rounded-2xl">
                <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} className="w-20 bg-transparent text-center font-black focus:outline-none text-indigo-400" />
                <button onClick={handleAction} disabled={isTxPending || isConfirming} className="h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white transition-all">
                  {needsApproval ? 'Authorize' : 'Lock'}
                </button>
              </div>
            )}
            {isExpired && isStaked && (
              <button onClick={handleClaim} disabled={isTxPending} className="h-16 w-16 flex items-center justify-center rounded-2xl glass-card bg-red-600/10 border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all">
                <Flame className="w-6 h-6" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
