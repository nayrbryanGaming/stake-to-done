import { useState, useEffect, useMemo } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt
} from 'wagmi'
import { injected } from 'wagmi/connectors'
import { formatUnits, parseUnits } from 'viem'
import {
  Wallet,
  PlusCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Coins,
  ShieldCheck,
  Trophy,
  ArrowRight,
  Flame,
  Zap,
  Target,
  Search,
  ExternalLink
} from 'lucide-react'

import {
  STAKE_TO_DONE_ADDRESS,
  STAKE_TO_DONE_ABI,
  MOCK_USDC_ADDRESS,
  MOCK_USDC_ABI
} from './constants'

function App() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { writeContract, data: hash, isPending: isTxPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [stakeAmountInput, setStakeAmountInput] = useState('10')
  const [searchQuery, setSearchQuery] = useState('')

  // Get user task IDs
  const { data: userTaskIds, refetch: refetchIds } = useReadContract({
    address: STAKE_TO_DONE_ADDRESS,
    abi: STAKE_TO_DONE_ABI,
    functionName: 'getUserTasks',
    args: [address],
    query: { enabled: !!address }
  })

  // Get USDC Balance
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: MOCK_USDC_ADDRESS,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address }
  })

  // Auto refetch on confirmation
  useEffect(() => {
    if (isConfirmed) {
      refetchIds()
      refetchBalance()
    }
  }, [isConfirmed, refetchIds, refetchBalance])

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!deadline) return
    const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000)
    writeContract({
      address: STAKE_TO_DONE_ADDRESS,
      abi: STAKE_TO_DONE_ABI,
      functionName: 'createTask',
      args: [description, BigInt(deadlineTimestamp)],
    })
    setDescription('')
    setDeadline('')
  }

  const handleMint = () => {
    writeContract({
      address: MOCK_USDC_ADDRESS,
      abi: MOCK_USDC_ABI,
      functionName: 'mint',
      args: [address, parseUnits('1000', 18)],
    })
  }

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <header className="flex justify-between items-center py-8 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">STAKE-TO-DONE</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Proof of Commitment</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-4 pl-4 h-12">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-mono text-gray-300">{address.slice(0, 6)}...{address.slice(-4)}</span>
                <button onClick={() => disconnect()} className="text-xs font-bold text-gray-500 hover:text-white transition-colors ml-2 uppercase">Exit</button>
              </div>
            ) : (
              <button
                onClick={() => connect({ connector: injected() })}
                className="h-12 bg-gradient-to-r from-indigo-600 to-purple-700 px-6 rounded-2xl font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/30"
              >
                <Wallet className="w-4 h-4" /> Connect Wallet
              </button>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-8">
            <div className="glass-card p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="w-48 h-48" />
              </div>
              <div className="flex items-center gap-3 mb-6 bg-indigo-500/10 w-fit px-4 py-1.5 rounded-full border border-indigo-500/20">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Protocol MVP v1.0</span>
              </div>
              <h2 className="text-5xl font-black mb-4 leading-[1.1]">Put Your Money Where Your <span className="text-indigo-400 text-glow">Goal</span> Is.</h2>
              <p className="text-gray-400 text-lg max-w-xl mb-10">Use loss aversion to crush procrastination. Stake USDC on your tasks. Complete them to earn it back, fail and your funds are burned.</p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-6 py-4 border border-white/5">
                  <Coins className="text-yellow-400" />
                  <div>
                    <div className="text-2xl font-black leading-none">{usdcBalance ? formatUnits(usdcBalance, 18) : '0.00'}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Available USDC</div>
                  </div>
                </div>
                <button onClick={handleMint} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Mint Test Tokens
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="glass-card p-8 h-full bg-indigo-600/5 border-indigo-500/20">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Zap className="text-indigo-500" /> Create Goal
              </h3>
              <form onSubmit={handleCreateTask} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Finish frontend build..."
                    className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-5 text-white placeholder:text-gray-700/50 focus:border-indigo-500/50 focus:ring-0 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-5 text-white focus:border-indigo-500/50 focus:ring-0 outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!isConnected || isTxPending}
                  className="w-full h-14 btn-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  Create Task <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                {isTxPending && <p className="text-center text-xs text-indigo-400 animate-pulse font-bold">Awaiting Transaction...</p>}
              </form>
            </div>
          </div>
        </div>

        {/* Task List Section */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-3xl font-black flex items-center gap-4">
              Active Commitments
              <span className="text-sm bg-white/5 border border-white/10 h-8 px-4 flex items-center justify-center rounded-full font-bold text-gray-500">
                {userTaskIds?.length || 0}
              </span>
            </h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm focus:border-indigo-500/50 outline-none transition-all"
              />
            </div>
          </div>

          {!userTaskIds || userTaskIds.length === 0 ? (
            <div className="glass-card p-20 text-center border-dashed border-2">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-gray-600" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-gray-300">No active goals yet</h4>
              <p className="text-gray-500 max-w-sm mx-auto">The best time to start was yesterday. The second best time is now. Create your first task to the right.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {userTaskIds.map(id => (
                <TaskItem
                  key={id.toString()}
                  id={id}
                  refetchAll={() => { refetchIds(); refetchBalance(); }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function TaskItem({ id, refetchAll }) {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending: isTxPending } = useWriteContract()
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const [stakeAmount, setStakeAmount] = useState('10')

  const { data: task, refetch: refetchTask } = useReadContract({
    address: STAKE_TO_DONE_ADDRESS,
    abi: STAKE_TO_DONE_ABI,
    functionName: 'tasks',
    args: [id]
  })

  const { data: allowance } = useReadContract({
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
    }
  }, [isConfirmed, refetchTask, refetchAll])

  if (!task) return null

  const [taskId, user, description, amount, deadline, completed, claimed] = task
  const isExpired = Number(deadline) < Date.now() / 1000
  const isStaked = amount > 0n
  const needsApproval = (allowance || 0n) < parseUnits(stakeAmount, 18)

  const handleAction = () => {
    if (!isStaked) {
      if (needsApproval) {
        writeContract({
          address: MOCK_USDC_ADDRESS,
          abi: MOCK_USDC_ABI,
          functionName: 'approve',
          args: [STAKE_TO_DONE_ADDRESS, parseUnits(stakeAmount, 18)], // Large amount or exactly
        })
      } else {
        writeContract({
          address: STAKE_TO_DONE_ADDRESS,
          abi: STAKE_TO_DONE_ABI,
          functionName: 'stakeTask',
          args: [BigInt(taskId), parseUnits(stakeAmount, 18)],
        })
      }
    } else if (!completed && !claimed) {
      writeContract({
        address: STAKE_TO_DONE_ADDRESS,
        abi: STAKE_TO_DONE_ABI,
        functionName: 'completeTask',
        args: [BigInt(taskId)],
      })
    }
  }

  const handleClaim = () => {
    writeContract({
      address: STAKE_TO_DONE_ADDRESS,
      abi: STAKE_TO_DONE_ABI,
      functionName: 'claimExpiredTask',
      args: [BigInt(taskId)],
    })
  }

  return (
    <div className={`glass-card p-4 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 transition-all border-l-4 ${completed ? 'border-l-green-500 opacity-60' : claimed ? 'border-l-red-500' : isStaked ? 'border-l-yellow-500' : 'border-l-indigo-500'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-gray-400">Task #{taskId.toString()}</span>
          {completed ? (
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-md text-green-400 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Mission Success</span>
          ) : claimed ? (
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 flex items-center gap-1.5"><Flame className="w-3 h-3" /> Funds Burned</span>
          ) : isStaked ? (
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-yellow-400 flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Skin in the game</span>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-indigo-400 flex items-center gap-1.5"><Zap className="w-3 h-3" /> Uncommitted</span>
          )}
          {isExpired && !completed && !claimed && <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-red-600/10 border border-red-600/20 rounded-md text-red-600">Expired</span>}
        </div>
        <h3 className="text-2xl font-black text-white truncate mb-2">{description}</h3>
        <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500/50" />
            <span>DL: {new Date(Number(deadline) * 1000).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-500/50" />
            <span className="text-gray-300">{isStaked ? formatUnits(amount, 18) : stakeAmount} <span className="text-[10px] uppercase font-bold text-gray-600">USDC Stake</span></span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        {!completed && !claimed && (
          <>
            {isStaked ? (
              <button
                onClick={handleAction}
                disabled={isTxPending || isExpired}
                className={`h-14 px-8 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${isTxPending ? 'bg-white/5 opacity-50' : 'bg-green-600 hover:bg-green-500 hover:scale-[1.02] shadow-xl shadow-green-600/20 underline-offset-4'}`}
              >
                {isTxPending ? 'Confirming...' : 'I Finished This'} <Trophy className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center bg-black/40 rounded-2xl border border-white/10 p-1">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-20 bg-transparent text-center font-black focus:outline-none transition-all"
                />
                <button
                  onClick={handleAction}
                  disabled={isTxPending}
                  className={`h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${isTxPending ? 'bg-white/5 opacity-50' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                >
                  {needsApproval ? 'Approve USDC' : 'Stake USDC'}
                </button>
              </div>
            )}

            {isExpired && (
              <button
                onClick={handleClaim}
                disabled={isTxPending}
                className="h-14 w-14 flex items-center justify-center rounded-2xl bg-red-600/10 border border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white transition-all"
              >
                <Flame className="w-5 h-5" />
              </button>
            )}
          </>
        )}

        {completed && (
          <div className="h-14 px-8 rounded-2xl border border-green-500/20 bg-green-500/5 text-green-500 font-black text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> SUCCESS
          </div>
        )}

        {claimed && (
          <div className="h-14 px-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 font-black text-sm flex items-center gap-2">
            <Flame className="w-5 h-5" /> PENALIZED
          </div>
        )}
      </div>
    </div>
  )
}

export default App
