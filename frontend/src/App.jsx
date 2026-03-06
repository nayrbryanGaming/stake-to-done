import { useState, useEffect, useMemo } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance
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
  ExternalLink,
  ChevronRight,
  LayoutDashboard,
  Bell,
  Settings,
  LogOut
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
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMsg, setNotificationMsg] = useState('')

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

  const notify = (msg) => {
    setNotificationMsg(msg)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 5000)
  }

  useEffect(() => {
    if (isConfirmed) {
      refetchIds()
      refetchBalance()
      notify('Transaction Confirmed! Protocol Updated.')
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
    <div className="min-h-screen pb-20 overflow-x-hidden selection:bg-indigo-500/30">
      {/* Premium Mesh Background */}
      <div className="mesh-bg">
        <div className="mesh-circle c-1"></div>
        <div className="mesh-circle c-2"></div>
      </div>

      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50 animate-in">
          <div className="glass-card px-6 py-4 flex items-center gap-3 border-indigo-500/50 shadow-2xl shadow-indigo-500/20">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-sm font-bold">{notificationMsg}</p>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Navigation Bar */}
        <nav className="flex justify-between items-center py-8 mb-12 animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[20px] flex items-center justify-center shadow-2xl shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-500">
              <Zap className="w-7 h-7 text-white fill-white/20" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none font-heading">STAKE-TO-DONE</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-indigo-400/80">Proof of Commitment</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {isConnected ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Staking Wallet</span>
                  <span className="text-sm font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="w-12 h-12 glass-card flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-all active:scale-90"
                  title="Disconnect"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => connect({ connector: injected() })}
                className="btn-primary h-14 px-8 rounded-2xl font-black flex items-center gap-3 text-white group"
              >
                <Wallet className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Connect Protocol
              </button>
            )}
          </div>
        </nav>

        <main className="grid lg:grid-cols-12 gap-10">
          {/* Left Column: Dashboard & Stats */}
          <div className="lg:col-span-8 space-y-10">
            {/* Hero Card */}
            <div className="glass-card p-12 relative overflow-hidden animate-in" style={{ animationDelay: '0.2s' }}>
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]"></div>
              <div className="absolute top-12 right-12 opacity-5 scale-150 rotate-12">
                <Target className="w-64 h-64" />
              </div>

              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-8 bg-white/5 w-fit px-5 py-2 rounded-full border border-white/10 backdrop-blur-md">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Protocol Version 1.0.4 - Mainnet Ready</span>
                </div>

                <h2 className="text-6xl font-black mb-6 leading-[1.05] font-heading tracking-tight">
                  Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-glow">Time</span>,<br />
                  Stake Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 text-glow">Goal</span>.
                </h2>

                <p className="text-gray-400 text-xl leading-relaxed mb-12 font-medium">
                  The ultimate anti-procrastination protocol. Lock USDC on your commitments. Finish on time to reclaim your assets, fail and embrace the burn.
                </p>

                <div className="flex flex-wrap gap-6">
                  <div className="glass-card bg-indigo-500/5 px-8 py-5 border-indigo-500/20 group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                        <Coins className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-3xl font-black tabular-nums">
                          {usdcBalance ? Number(formatUnits(usdcBalance, 18)).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                        </div>
                        <div className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Available USDC</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleMint}
                    className="btn-glass h-[74px] px-8 rounded-2xl font-bold flex items-center gap-3 hover:border-indigo-500/40 text-gray-300 hover:text-white transition-all"
                  >
                    <PlusCircle className="w-5 h-5 text-indigo-400" />
                    <span>Get Test Funds</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Task List Header */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6 animate-in" style={{ animationDelay: '0.3s' }}>
              <div>
                <h3 className="text-4xl font-black font-heading tracking-tight mb-2 flex items-center gap-4">
                  Commitments
                  <span className="text-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-10 h-10 flex items-center justify-center rounded-xl font-black italic">
                    {userTaskIds?.length || 0}
                  </span>
                </h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Live Protocol Tasks</p>
              </div>

              <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Filter by description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 text-sm focus:border-indigo-500/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-gray-700 font-bold"
                />
              </div>
            </div>

            {/* Task List Grid */}
            <div className="animate-in space-y-6" style={{ animationDelay: '0.4s' }}>
              {!userTaskIds || userTaskIds.length === 0 ? (
                <div className="glass-card p-24 text-center border-dashed border-2 bg-transparent">
                  <div className="w-24 h-24 bg-white/5 border border-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-8 rotate-12 group hover:rotate-0 transition-transform duration-500">
                    <Clock className="w-12 h-12 text-gray-700 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <h4 className="text-2xl font-black mb-3 text-gray-400 uppercase tracking-tight">System Idle</h4>
                  <p className="text-gray-600 max-w-xs mx-auto font-bold">No commitments found on-chain. Deploy your first task to begin protocol enforcement.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {userTaskIds.map(id => (
                    <TaskItem
                      key={id.toString()}
                      id={id}
                      refetchAll={() => { refetchIds(); refetchBalance(); }}
                      searchQuery={searchQuery}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Creation Interface */}
          <div className="lg:col-span-4 space-y-8 sticky top-10 h-fit">
            <div className="glass-card p-10 bg-indigo-600/[0.03] border-indigo-500/20 animate-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black flex items-center gap-3 font-heading">
                  <Zap className="text-indigo-500 fill-indigo-500/20" /> New Goal
                </h3>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Commitment Description</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., SHIP MVP PROTOCOL"
                      className="w-full h-16 bg-black/40 border border-white/10 rounded-2xl px-6 text-white font-bold placeholder:text-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Execution Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full h-16 bg-black/40 border border-white/10 rounded-2xl px-6 text-white font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all [color-scheme:dark]"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!isConnected || isTxPending}
                    className="w-full h-20 btn-primary text-white font-black rounded-[24px] text-lg flex items-center justify-center gap-3 group disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Initiate Commitment</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </button>
                  {isTxPending && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-indigo-400 animate-pulse">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Awaiting Block...</span>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Protocol Tips */}
            <div className="glass-card p-8 bg-transparent border-dashed animate-in" style={{ animationDelay: '0.6s' }}>
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-500" /> Protocol Rules
              </h4>
              <ul className="space-y-4">
                {[
                  { icon: Trophy, text: "Stake to prove your resolve." },
                  { icon: ShieldCheck, text: "Finish on time to get paid back." },
                  { icon: Flame, text: "Miss the deadline? Stake is burned." }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-bold text-gray-600">
                    <item.icon className="w-4 h-4 text-gray-700" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function TaskItem({ id, refetchAll, searchQuery }) {
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

  // Search Filter
  if (searchQuery && !description.toLowerCase().includes(searchQuery.toLowerCase())) return null

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
          args: [STAKE_TO_DONE_ADDRESS, parseUnits(stakeAmount, 18)],
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
    <div className={`glass-card p-8 flex flex-col md:flex-row items-stretch md:items-center gap-8 group transition-all duration-500 overflow-hidden relative ${completed ? 'border-l-4 border-l-emerald-500 bg-emerald-500/[0.02]' :
        claimed ? 'border-l-4 border-l-red-500 bg-red-500/[0.02]' :
          isStaked ? 'border-l-4 border-l-amber-500 bg-amber-500/[0.02]' :
            'border-l-4 border-l-indigo-500 bg-indigo-500/[0.02]'
      }`}>
      {/* Visual Indicator Background */}
      <div className={`absolute top-0 right-0 w-32 h-full opacity-[0.03] transition-opacity group-hover:opacity-[0.07] ${completed ? 'bg-emerald-500' : claimed ? 'bg-red-500' : isStaked ? 'bg-amber-500' : 'bg-indigo-500'
        }`}></div>

      <div className="flex-1 relative z-10">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-500">Task Protocol ID #{taskId.toString()}</span>

          {completed ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10">
              <CheckCircle className="w-3.5 h-3.5" /> Mission Verified
            </div>
          ) : claimed ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-black uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5" /> Protocol Burned
            </div>
          ) : isStaked ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/10 scale-105">
              <ShieldCheck className="w-3.5 h-3.5 animate-pulse" /> Active Resolve
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5" /> Pending Stake
            </div>
          )}

          {isExpired && !completed && !claimed && (
            <span className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 border border-red-600/30 rounded-lg text-red-500 text-[10px] font-black uppercase tracking-widest animate-bounce">
              <Bell className="w-3.5 h-3.5" /> Defeated
            </span>
          )}
        </div>

        <h3 className="text-3xl font-black text-white mb-4 tracking-tight group-hover:text-indigo-400 transition-colors uppercase font-heading">{description}</h3>

        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Termination Date</div>
              <div className="text-xs font-bold text-gray-400">{new Date(Number(deadline) * 1000).toLocaleString()}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <Coins className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Asset Commitment</div>
              <div className="text-xs font-bold text-gray-200">
                {isStaked ? formatUnits(amount, 18) : stakeAmount} <span className="text-[10px] font-black text-gray-600 ml-1">USDC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-stretch md:items-center gap-4 w-full md:w-auto relative z-10">
        {!completed && !claimed && (
          <>
            {isStaked ? (
              <button
                onClick={handleAction}
                disabled={isTxPending || isExpired}
                className="h-20 px-10 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-600/30 disabled:opacity-30 disabled:grayscale group/btn"
              >
                {isTxPending ? 'Verifying...' : 'Settle Proof'}
                <Trophy className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="flex items-center glass-card bg-black/40 border-white/10 p-1 rounded-2xl">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-24 bg-transparent text-center font-black focus:outline-none transition-all text-indigo-400"
                  />
                  <button
                    onClick={handleAction}
                    disabled={isTxPending}
                    className="h-14 px-8 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20"
                  >
                    {isTxPending ? '...' : needsApproval ? 'Authorize' : 'Lock Stake'}
                  </button>
                </div>
              </div>
            )}

            {isExpired && (
              <button
                onClick={handleClaim}
                disabled={isTxPending}
                className="h-20 w-20 flex items-center justify-center rounded-2xl glass-card bg-red-600/10 border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 group/claim"
                title="Protocol Cleanup: Burn Stake"
              >
                <Flame className="w-8 h-8 group-hover/claim:animate-pulse" />
              </button>
            )}
          </>
        )}

        {completed && (
          <div className="h-20 px-10 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-black text-sm flex items-center gap-3 animate-in">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 fill-emerald-500/20" />
            </div>
            PROVED
          </div>
        )}

        {claimed && (
          <div className="h-20 px-10 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 font-black text-sm flex items-center gap-3 animate-in">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-red-500/20" />
            </div>
            BURNED
          </div>
        )}
      </div>
    </div>
  )
}

export default App
