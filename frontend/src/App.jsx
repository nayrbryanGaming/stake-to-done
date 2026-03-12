import { useEffect, useMemo, useState } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain
} from 'wagmi'
import { injected } from 'wagmi/connectors'
import { baseSepolia } from 'wagmi/chains'
import { Search, Wallet, Clock } from 'lucide-react'
import { parseUnits } from 'viem'
import { motion as Motion, AnimatePresence as AnimatePresenceMotion } from 'framer-motion'
import {
  STAKE_TO_DONE_ADDRESS,
  STAKE_TO_DONE_ABI,
  USDC_ADDRESS,
  USDC_ABI,
  USDC_DECIMALS
} from './constants'
import { Header, Toast } from './components/Layout'
import { Hero } from './components/Hero'
import { TaskForm } from './components/TaskForm'
import { TaskItem } from './components/TaskItem'

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
  const [stakeAmount, setStakeAmount] = useState('10')
  const [searchQuery, setSearchQuery] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMsg, setNotificationMsg] = useState('')
  const [mounted, setMounted] = useState(false)

  const isWrongChain = isConnected && chainId !== baseSepolia.id

  const notify = (msg) => {
    setNotificationMsg(msg)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 5000)
  }

  useEffect(() => {
    if (writeError) notify(writeError.shortMessage || writeError.message)
    if (txError) notify(txError.shortMessage || txError.message)
  }, [writeError, txError])

  const { data: userTaskIds, refetch: refetchIds } = useReadContract({
    address: STAKE_TO_DONE_ADDRESS,
    abi: STAKE_TO_DONE_ABI,
    functionName: 'getUserTasks',
    args: [address],
    query: { enabled: !!address && !isWrongChain }
  })

  const { data: userTasks, refetch: refetchTasks } = useReadContract({
    address: STAKE_TO_DONE_ADDRESS,
    abi: STAKE_TO_DONE_ABI,
    functionName: 'getTaskDetails',
    args: [userTaskIds || []],
    query: { enabled: !!address && !isWrongChain && !!userTaskIds && userTaskIds.length > 0 }
  })

  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address && !isWrongChain,
      refetchInterval: 5000
    }
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [address, STAKE_TO_DONE_ADDRESS],
    query: { enabled: !!address && !isWrongChain }
  })

  useEffect(() => {
    if (isConfirmed) {
      refetchIds()
      refetchTasks()
      refetchBalance()
      refetchAllowance()
      notify('Transaction confirmed')
    }
  }, [isConfirmed, refetchIds, refetchTasks, refetchBalance, refetchAllowance])

  useEffect(() => setMounted(true), [])

  const handleCreateTask = (e) => {
    e.preventDefault()

    if (!isConnected) return notify('Connect wallet first')
    if (isWrongChain) return switchChain({ chainId: baseSepolia.id })

    const cleanedDescription = description.trim()
    if (!cleanedDescription) return notify('Task description is required')
    if (!deadline) return notify('Deadline is required')
    if (!stakeAmount || Number(stakeAmount) <= 0) return notify('Stake amount must be greater than zero')

    try {
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000)
      if (!Number.isFinite(deadlineTimestamp) || deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
        return notify('Deadline must be in the future')
      }

      const amountWei = parseUnits(stakeAmount, USDC_DECIMALS)

      if ((allowance || 0n) < amountWei) {
        notify('Approve USDC first')
        writeContract({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [STAKE_TO_DONE_ADDRESS, amountWei]
        })
        return
      }

      notify('Submitting task...')
      writeContract({
        address: STAKE_TO_DONE_ADDRESS,
        abi: STAKE_TO_DONE_ABI,
        functionName: 'createAndStakeTask',
        args: [cleanedDescription, BigInt(deadlineTimestamp), amountWei]
      })

      setDescription('')
      setDeadline('')
    } catch {
      notify('Failed to submit task')
    }
  }

  const handleMint = () => {
    if (!isConnected) return notify('Connect wallet first')
    if (isWrongChain) return switchChain({ chainId: baseSepolia.id })

    writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'mint',
      args: [address, parseUnits('1000', USDC_DECIMALS)]
    })
  }

  const allTasks = useMemo(() => [...(userTasks || [])].reverse(), [userTasks])
  const activeTasks = useMemo(() => allTasks.filter((t) => !t.completed && !t.claimed), [allTasks])
  const historyTasks = useMemo(() => allTasks.filter((t) => t.completed || t.claimed), [allTasks])
  const displayTasks = showHistory ? historyTasks : activeTasks

  const settledTaskCount = useMemo(
    () => allTasks.filter((t) => t.completed || t.claimed).length,
    [allTasks]
  )
  const stats = {
    successCount: allTasks.filter((t) => t.completed).length,
    failureCount: allTasks.filter((t) => t.claimed && !t.completed).length,
    activeCount: activeTasks.length,
    successRate: settledTaskCount > 0
      ? Math.round((allTasks.filter((t) => t.completed).length / settledTaskCount) * 100)
      : 0
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen pb-10 flex flex-col">
      <div className="mesh-bg">
        <div className="mesh-circle c-1 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="mesh-circle c-2 animate-pulse" style={{ animationDuration: '12s' }}></div>
      </div>

      <header className="sticky-top-nav">
        <div className="container">
          <Header
            address={address}
            isConnected={isConnected}
            connect={connect}
            disconnect={disconnect}
            injected={injected}
            usdcBalance={usdcBalance}
          />
        </div>
      </header>

      {isWrongChain && (
        <div className="p-2 text-center bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest">
          Wrong network. Please switch to Base Sepolia.
          <button onClick={() => switchChain({ chainId: baseSepolia.id })} className="ml-4 underline">Switch now</button>
        </div>
      )}

      <Toast showNotification={showNotification} notificationMsg={notificationMsg} />

      <main className="container flex-1 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-8 space-y-6"
          >
            <Hero usdcBalance={usdcBalance} handleMint={handleMint} />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-black uppercase tracking-widest text-white leading-none font-outfit">
                  Tasks <span className="text-gradient ml-2">{displayTasks.length}</span>
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className={`text-xs font-black uppercase tracking-widest transition-opacity font-outfit ${!showHistory ? 'opacity-100 text-secondary' : 'opacity-40 hover:opacity-100'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setShowHistory(true)}
                  className={`text-xs font-black uppercase tracking-widest transition-opacity font-outfit ${showHistory ? 'opacity-100 text-secondary' : 'opacity-40 hover:opacity-100'}`}
                >
                  History
                </button>
              </div>

              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search task..."
                  className="input-field border-primary-dim pl-9 h-9 text-xs w-full sm:w-64"
                />
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresenceMotion mode="popLayout">
                {!isConnected ? (
                  <Motion.div
                    key="no-connect"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card text-center py-10"
                  >
                    <Wallet className="w-6 h-6 mx-auto mb-3 text-primary opacity-40" />
                    <h4 className="text-sm font-black mb-1 font-outfit uppercase tracking-widest text-white">Connect your wallet</h4>
                    <p className="text-[10px] text-dim mb-6 uppercase font-bold">You need a wallet to create or manage tasks.</p>
                    <button onClick={() => connect({ connector: injected() })} className="btn-primary py-2 px-8 text-[10px] uppercase">Connect</button>
                  </Motion.div>
                ) : displayTasks.length === 0 ? (
                  <Motion.div
                    key="no-tasks"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-card text-center py-10 opacity-50"
                  >
                    <Clock className="w-6 h-6 mx-auto mb-3 text-gray-600" />
                    <p className="text-[10px] uppercase font-bold tracking-widest">
                      {showHistory ? 'No task history yet' : 'No active tasks'}
                    </p>
                  </Motion.div>
                ) : (
                  <div className="space-y-3">
                    {displayTasks.map((task, index) => (
                      <Motion.div
                        key={task.id.toString()}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <TaskItem
                          id={task.id}
                          initialTask={task}
                          searchQuery={searchQuery}
                          notify={notify}
                          refetchAll={() => {
                            refetchIds()
                            refetchTasks()
                            refetchBalance()
                            refetchAllowance()
                          }}
                        />
                      </Motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresenceMotion>
            </div>
          </Motion.div>

          <Motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <div className="sticky top-20">
              <TaskForm
                description={description}
                setDescription={setDescription}
                deadline={deadline}
                setDeadline={setDeadline}
                stakeAmount={stakeAmount}
                setStakeAmount={setStakeAmount}
                handleCreateTask={handleCreateTask}
                isConnected={isConnected}
                isTxPending={isTxPending}
                isConfirming={isConfirming}
              />

              <div className="mt-6 glass-card p-6 border-primary/10">
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 text-dim">Summary</h4>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-black text-gradient font-outfit">{stats.successRate}%</span>
                  <span className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 font-outfit">Success Rate</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold opacity-40">Completed</span>
                    <span className="text-xs font-black text-emerald-500">{stats.successCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold opacity-40">Expired</span>
                    <span className="text-xs font-black text-rose-500">{stats.failureCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold opacity-40">Active</span>
                    <span className="text-xs font-black text-white">{stats.activeCount}</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-1000"
                      style={{ width: `${stats.successRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 glass-card p-4 border-white/5 bg-white/2">
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-50">Network</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-outfit">
                    <span className="text-dim uppercase">Chain</span>
                    <span className="font-bold text-gradient">Base Sepolia</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="opacity-40 uppercase">Status</span>
                    <span className="font-bold text-white uppercase">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </Motion.aside>
        </div>
      </main>

      <footer className="container mt-auto py-6 border-t border-white/5">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px]">
          <div className="flex gap-6 uppercase font-bold tracking-widest">
            <a href={`https://sepolia.basescan.org/address/${STAKE_TO_DONE_ADDRESS}`} target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">Contract</a>
            <a href={`https://sepolia.basescan.org/address/${USDC_ADDRESS}`} target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">Token</a>
          </div>
          <p className="opacity-20 uppercase font-black tracking-widest">Stake-To-Done 2026</p>
        </div>
      </footer>
    </div>
  )
}

export default App
