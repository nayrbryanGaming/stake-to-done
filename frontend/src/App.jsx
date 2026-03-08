import { useState, useEffect, useMemo } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
  useChainId,
  useSwitchChain
} from 'wagmi'
import { injected } from 'wagmi/connectors'
import { baseSepolia } from 'wagmi/chains'
import { formatUnits, parseUnits } from 'viem'
import confetti from 'canvas-confetti'
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
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { writeContract, data: hash, isPending: isTxPending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash })

  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMsg, setNotificationMsg] = useState('')

  const isWrongChain = isConnected && chainId !== baseSepolia.id

  // Enhanced Error Logging
  useEffect(() => {
    if (writeError) {
      console.error("Contract Write Error:", writeError)
      notify(`Action Failed: ${writeError.shortMessage || writeError.message}`)
    }
    if (txError) {
      console.error("Transaction Error:", txError)
      notify(`Transaction Failed: ${txError.message}`)
    }
  }, [writeError, txError])

  // Get user task IDs
  const { data: userTaskIds, refetch: refetchIds, isError: idsError } = useReadContract({
    address: STAKE_TO_DONE_ADDRESS,
    abi: STAKE_TO_DONE_ABI,
    functionName: 'getUserTasks',
    args: [address],
    query: {
      enabled: !!address && !isWrongChain,
      staleTime: 5000,
      refetchInterval: 10000
    }
  })

  const isLoadingTasks = !userTaskIds && !idsError && isConnected

  // Log connectivity issues
  useEffect(() => {
    if (idsError) console.error("Failed to fetch task IDs. Is the contract address correct?", STAKE_TO_DONE_ADDRESS)
  }, [idsError])

  // Get USDC Balance
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: MOCK_USDC_ADDRESS,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address && !isWrongChain }
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
      notify('Protocol Update Successful')
    }
  }, [isConfirmed, refetchIds, refetchBalance])

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!deadline || !isConnected) return
    if (isWrongChain) {
      switchChain({ chainId: baseSepolia.id })
      return
    }

    if (!description.trim()) {
      notify('Description cannot be empty')
      return
    }

    try {
      const selectedDate = new Date(deadline)
      if (isNaN(selectedDate.getTime())) {
        notify('Invalid deadline date')
        return
      }

      const deadlineTimestamp = Math.floor(selectedDate.getTime() / 1000)
      const now = Math.floor(Date.now() / 1000)

      if (deadlineTimestamp <= now) {
        notify('Deadline must be in the future')
        return
      }

      writeContract({
        address: STAKE_TO_DONE_ADDRESS,
        abi: STAKE_TO_DONE_ABI,
        functionName: 'createTask',
        args: [description.trim(), BigInt(deadlineTimestamp)],
      })
      setDescription('')
      setDeadline('')
    } catch (err) {
      console.error("Creation Error:", err)
      notify('Failed to initiate task')
    }
  }

  const handleMint = () => {
    if (!isConnected) return
    if (isWrongChain) {
      switchChain({ chainId: baseSepolia.id })
      return
    }
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

      {/* Network Warning */}
      {isWrongChain && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white py-2 z-[60] text-center text-xs font-black uppercase tracking-widest animate-pulse">
          Wrong Network. Switch to Base Sepolia to continue protocol enforcement.
          <button onClick={() => switchChain({ chainId: baseSepolia.id })} className="ml-4 underline">Switch Now</button>
        </div>
      )}

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
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-indigo-400/80">Base Sepolia Sync Active</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {isConnected ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Staking Wallet</span>
                  <span className="text-sm font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
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
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Protocol Version 1.0.5 - Base Sepolia HOTFIX</span>
                </div>

                <h2 className="text-6xl font-black mb-6 leading-[1.05] font-heading tracking-tight">
                  Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-glow">Time</span>,<br />
                  Stake Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 text-glow">Goal</span>.
                  <div className="text-xs text-indigo-500 mt-2">[ BUILD_ID: COMMIT_5BA48D_RELOADED ]</div>
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

                  <div className="glass-card bg-purple-500/5 px-8 py-5 border-purple-500/20 group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-3xl font-black tabular-nums">
                          {userTaskIds ? (userTaskIds.length * 10).toLocaleString() : '0'}
                        </div>
                        <div className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Protocol TrustScore</div>
                      </div>
                    </div>
                  </div>
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
              {!isConnected ? (
                <div className="glass-card p-24 text-center border-dashed border-2 bg-transparent">
                  <div className="w-24 h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                    <Wallet className="w-12 h-12 text-indigo-400" />
                  </div>
                  <h4 className="text-2xl font-black mb-3 text-white uppercase tracking-tight">Connect Protocol</h4>
                  <p className="text-gray-500 max-w-xs mx-auto font-bold mb-8">Synchronize your wallet to access the decentralized commitment ledger.</p>
                  <button
                    onClick={() => connect({ connector: injected() })}
                    className="btn-primary h-14 px-8 rounded-2xl font-black flex items-center gap-3 text-white mx-auto"
                  >
                    Authorize Wallet
                  </button>
                </div>
              ) : isWrongChain ? (
                <div className="glass-card p-24 text-center border-red-500/20 bg-red-500/[0.02]">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                  <h4 className="text-2xl font-black mb-3 text-red-400 uppercase tracking-tight">Protocol Mismatch</h4>
                  <p className="text-gray-500 max-w-xs mx-auto font-bold mb-8">The protocol requires Base Sepolia. Please switch networks to continue.</p>
                  <button
                    onClick={() => switchChain({ chainId: baseSepolia.id })}
                    className="h-14 px-8 rounded-2xl bg-red-600 text-white font-black flex items-center gap-3 mx-auto hover:bg-red-500 transition-colors"
                  >
                    Switch to Base Sepolia
                  </button>
                </div>
              ) : idsError ? (
                <div className="glass-card p-24 text-center border-red-500/20 bg-red-500/[0.02]">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                  <h4 className="text-2xl font-black mb-3 text-red-400 uppercase tracking-tight">Sync Failure</h4>
                  <p className="text-gray-500 max-w-xs mx-auto font-bold mb-8">Failed to synchronize with the protocol. This could be due to an RPC issue or an incorrect contract address.</p>
                  <button
                    onClick={() => refetchIds()}
                    className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black flex items-center gap-3 mx-auto hover:bg-indigo-500 transition-colors"
                  >
                    Retry Synchronization
                  </button>
                </div>
              ) : !userTaskIds ? (
                <div className="glass-card p-24 text-center">
                  <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Synchronizing with Base Protocol...</p>
                </div>
              ) : userTaskIds.length === 0 ? (
                <div className="glass-card p-24 text-center border-dashed border-2 bg-transparent">
                  <div className="w-24 h-24 bg-white/5 border border-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-8 rotate-12 group hover:rotate-0 transition-transform duration-500">
                    <Clock className="w-12 h-12 text-gray-700 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <h4 className="text-2xl font-black mb-3 text-gray-400 uppercase tracking-tight">System Idle</h4>
                  <p className="text-gray-600 max-w-xs mx-auto font-bold">No commitments found on-chain. Deploy your first task to begin protocol enforcement.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {isLoadingTasks ? (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                      <div className="text-gray-500 font-medium animate-pulse">Synchronizing with Base...</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {[...userTaskIds].reverse().map(id => (
                        <TaskItem
                          key={id.toString()}
                          id={id}
                          searchQuery={searchQuery}
                          notify={notify}
                          refetchAll={() => {
                            refetchIds()
                            refetchBalance()
                          }}
                        />
                      ))}
                    </div>
                  )}
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
                    disabled={!isConnected || isTxPending || isConfirming}
                    className="w-full h-20 btn-primary text-white font-black rounded-[24px] text-lg flex items-center justify-center gap-3 group disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>{isConfirming ? 'Finalizing...' : 'Initiate Commitment'}</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </button>
                  {(isTxPending || isConfirming) && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-indigo-400 animate-pulse">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">{isConfirming ? 'Confirming Onchain...' : 'Awaiting Wallet...'}</span>
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

function Countdown({ deadline, onExpire }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const diff = Number(deadline) - now

      if (diff <= 0) {
        setTimeLeft('EXPIRED')
        clearInterval(timer)
        onExpire?.()
        return
      }

      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setTimeLeft(`${h}h ${m}m ${s}s`)
    }, 1000)

    return () => clearInterval(timer)
  }, [deadline, onExpire])

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/5 rounded-full">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
      <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-widest">{timeLeft}</span>
    </div>
  )
}

function TaskItem({ id, refetchAll, searchQuery, notify }) {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending: isTxPending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash })

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

  useEffect(() => {
    if (writeError) notify(`Contract Error: ${writeError.shortMessage || 'Rejected by Protocol'}`)
    if (txError) notify(`Transaction Error: ${txError.message}`)
  }, [writeError, txError, notify])

  // Separate effect for confetti to avoid loop
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

  // Support both array and object returns from wagmi/viem
  const taskId = typeof task === 'object' && !Array.isArray(task) ? task.id : task[0]
  const user = typeof task === 'object' && !Array.isArray(task) ? task.user : task[1]
  const description = typeof task === 'object' && !Array.isArray(task) ? task.description : task[2]
  const amount = typeof task === 'object' && !Array.isArray(task) ? task.stakeAmount : task[3]
  const deadline = typeof task === 'object' && !Array.isArray(task) ? task.deadline : task[4]
  const completed = typeof task === 'object' && !Array.isArray(task) ? task.completed : task[5]
  const claimed = typeof task === 'object' && !Array.isArray(task) ? task.claimed : task[6]

  // Search Filter
  if (searchQuery && !description.toString().toLowerCase().includes(searchQuery.toLowerCase())) return null

  const isExpired = Number(deadline) < Math.floor(Date.now() / 1000)
  const isStaked = amount > 0n
  const safeStakeAmount = stakeAmount && !isNaN(stakeAmount) ? stakeAmount : '0'
  const needsApproval = (allowance || 0n) < parseUnits(safeStakeAmount, 18)

  const handleAction = () => {
    try {
      if (isTxPending || isConfirming) return;

      const cleanStakeAmount = safeStakeAmount.toString().trim()
      if (!isStaked && (!cleanStakeAmount || isNaN(cleanStakeAmount) || Number(cleanStakeAmount) <= 0)) {
        notify("Enter a valid stake amount (> 0)")
        return
      }

      if (!isStaked) {
        const parsedAmount = parseUnits(cleanStakeAmount, 18)
        if (needsApproval) {
          writeContract({
            address: MOCK_USDC_ADDRESS,
            abi: MOCK_USDC_ABI,
            functionName: 'approve',
            args: [STAKE_TO_DONE_ADDRESS, parsedAmount],
          })
        } else {
          writeContract({
            address: STAKE_TO_DONE_ADDRESS,
            abi: STAKE_TO_DONE_ABI,
            functionName: 'stakeTask',
            args: [BigInt(taskId || 0), parsedAmount],
          })
        }
      } else if (!completed && !claimed) {
        writeContract({
          address: STAKE_TO_DONE_ADDRESS,
          abi: STAKE_TO_DONE_ABI,
          functionName: 'completeTask',
          args: [BigInt(taskId || 0)],
        })
      }
    } catch (err) {
      console.error("Action Failed:", err);
      notify("Action Failed: " + (err.shortMessage || "Check Console"))
    }
  }

  const handleClaim = () => {
    try {
      if (isTxPending || isConfirming) return;
      writeContract({
        address: STAKE_TO_DONE_ADDRESS,
        abi: STAKE_TO_DONE_ABI,
        functionName: 'claimExpiredTask',
        args: [BigInt(taskId || 0)],
      })
    } catch (err) {
      console.error("Claim Failed:", err);
      notify("Claim Failed.")
    }
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
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 status-glow-success">
              <CheckCircle className="w-3.5 h-3.5" /> Mission Verified
            </div>
          ) : claimed ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-black uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5" /> Protocol Burned
            </div>
          ) : isStaked ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/10 scale-105 status-glow-staked">
              <ShieldCheck className="w-3.5 h-3.5 animate-pulse" /> Active Resolve
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5" /> Pending Stake
            </div>
          )}

          {isExpired && !completed && !claimed && (
            <span className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 border border-red-600/30 rounded-lg text-red-500 text-[10px] font-black uppercase tracking-widest animate-bounce status-glow-failed">
              <Bell className="w-3.5 h-3.5" /> Defeated
            </span>
          )}

          {!completed && !claimed && !isExpired && (
            <Countdown deadline={deadline} onExpire={() => refetchTask()} />
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
              <div className="text-xs font-bold text-gray-400">{new Date(Number(deadline) * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
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
                disabled={isTxPending || isConfirming || isExpired}
                className="h-20 px-10 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-600/30 disabled:opacity-30 disabled:grayscale group/btn"
              >
                {isConfirming ? 'Finalizing...' : isTxPending ? 'Verifying...' : 'Settle Proof'}
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
                    disabled={isTxPending || isConfirming}
                    className="h-14 px-8 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20"
                  >
                    {isConfirming ? '...' : isTxPending ? '...' : needsApproval ? 'Authorize' : 'Lock Stake'}
                  </button>
                </div>
              </div>
            )}

            {isExpired && isStaked && (
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
          <div className="h-20 px-10 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-black text-sm flex items-center gap-3 animate-in shadow-lg shadow-emerald-500/5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 fill-emerald-500/20" />
            </div>
            PROTOCOL COMPLETE
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
