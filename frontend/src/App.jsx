import { useState, useEffect } from 'react'
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
import {
  STAKE_TO_DONE_ADDRESS,
  STAKE_TO_DONE_ABI,
  MOCK_USDC_ADDRESS,
  MOCK_USDC_ABI
} from './constants'
import { Header, Toast } from './components/Layout'
import { Hero } from './components/Hero'
import { TaskForm } from './components/TaskForm'
import { TaskItem } from './components/TaskItem'
import { Search, Wallet, AlertCircle, Clock } from 'lucide-react'
import { parseUnits } from 'viem'

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

  const isWrongChain = isConnected && chainId !== baseSepolia.id

  const notify = (msg) => {
    setNotificationMsg(msg)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 5000)
  }

  useEffect(() => {
    if (writeError) notify(`Error: ${writeError.shortMessage || writeError.message}`)
    if (txError) notify(`Transaction Error: ${txError.message}`)
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
    args: [userTaskIds],
    query: { enabled: !!userTaskIds && userTaskIds.length > 0 }
  })

  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: MOCK_USDC_ADDRESS,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { 
      enabled: !!address && !isWrongChain,
      refetchInterval: 5000 
    }
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: MOCK_USDC_ADDRESS,
    abi: MOCK_USDC_ABI,
    functionName: 'allowance',
    args: [address, STAKE_TO_DONE_ADDRESS],
    query: { enabled: !!address && !isWrongChain }
  })

  useEffect(() => {
    if (isConfirmed) {
      refetchIds()
      refetchTasks()
      refetchBalance()
      notify('Protocol Update Successful')
    }
  }, [isConfirmed, refetchIds, refetchTasks, refetchBalance])

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!deadline || !isConnected || !stakeAmount) return
    if (isWrongChain) return switchChain({ chainId: baseSepolia.id })

    try {
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000)
      if (deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
        return notify('Deadline must be in the future')
      }

      const amountWei = parseUnits(stakeAmount, 18)

      // 1. Check Allowance
      if (allowance < amountWei) {
        notify('Authorizing Tokens...')
        await writeContract({
          address: MOCK_USDC_ADDRESS,
          abi: MOCK_USDC_ABI,
          functionName: 'approve',
          args: [STAKE_TO_DONE_ADDRESS, amountWei],
        })
        return // Wait for approval tx to confirm, then user clicks again
      }

      // 2. Transact
      notify('Initiating Commitment...')
      writeContract({
        address: STAKE_TO_DONE_ADDRESS,
        abi: STAKE_TO_DONE_ABI,
        functionName: 'createAndStakeTask',
        args: [description.trim(), BigInt(deadlineTimestamp), amountWei],
      })
      
      setDescription('')
      setDeadline('')
    } catch (err) {
      notify('Failed to initiate task')
    }
  }

  const handleMint = () => {
    if (!isConnected) return
    if (isWrongChain) return switchChain({ chainId: baseSepolia.id })
    writeContract({
      address: MOCK_USDC_ADDRESS,
      abi: MOCK_USDC_ABI,
      functionName: 'mint',
      args: [address, parseUnits('1000', 18)],
    })
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Derive Tasks
  const allTasks = [...(userTasks || [])].reverse()
  const activeTasks = allTasks.filter(t => !t.completed && !t.claimed)
  const historyTasks = allTasks.filter(t => t.completed || t.claimed)
  const displayTasks = showHistory ? historyTasks : activeTasks

  // Calculate Stats
  const stats = {
    totalStaked: allTasks.reduce((acc, t) => acc + (t.stakeAmount || 0n), 0n),
    successCount: allTasks.filter(t => t.completed).length,
    failureCount: allTasks.filter(t => t.claimed && !t.completed).length,
    activeCount: activeTasks.length,
    successRate: allTasks.length > 0 ? Math.round((allTasks.filter(t => t.completed).length / (allTasks.filter(t => t.completed).length + allTasks.filter(t => t.claimed && !t.completed).length || 1)) * 100) : 100
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
            isWrongChain={isWrongChain} 
            switchChain={switchChain} 
            baseSepolia={baseSepolia} 
            usdcBalance={usdcBalance}
          />
        </div>
      </header>

      {isWrongChain && (
        <div className="p-2 text-center bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest">
          Wrong Network. Switch to Base Sepolia to continue.
          <button onClick={() => switchChain({ chainId: baseSepolia.id })} className="ml-4 underline">Switch Now</button>
        </div>
      )}

      <Toast showNotification={showNotification} notificationMsg={notificationMsg} />

      <main className="container flex-1 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6 animate-in">
            <Hero usdcBalance={usdcBalance} handleMint={handleMint} userTaskIds={userTaskIds} />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black uppercase tracking-widest text-white leading-none font-outfit">
                    Commitments <span className="text-gradient ml-1">{activeTasks.length}</span>
                  </h3>
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
                  placeholder="Filter logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-9 h-9 text-xs w-full sm:w-64"
                />
              </div>
            </div>

            <div className="space-y-3">
              {!isConnected ? (
                <div className="glass-card text-center py-10">
                  <Wallet className="w-6 h-6 mx-auto mb-3 text-primary opacity-40" />
                  <h4 className="text-sm font-bold mb-1">Authorization Required</h4>
                  <p className="text-[10px] text-gray-500 mb-6">Connect your wallet to start the protocol</p>
                  <button onClick={() => connect({ connector: injected() })} className="btn-primary py-2 px-8 text-[10px] uppercase">Authorize Now</button>
                </div>
              ) : displayTasks.length === 0 ? (
                <div className="glass-card text-center py-10 opacity-50">
                  <Clock className="w-6 h-6 mx-auto mb-3 text-gray-600" />
                  <p className="text-[10px] uppercase font-bold tracking-widest">
                    {showHistory ? 'No archived commitments' : 'No active commitments'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayTasks.map(task => (
                    <TaskItem 
                      key={task.id.toString()} 
                      id={task.id}
                      initialTask={task} 
                      searchQuery={searchQuery} 
                      notify={notify} 
                      refetchAll={() => { refetchIds(); refetchTasks(); refetchBalance(); refetchAllowance(); }} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4 animate-in" style={{ animationDelay: '0.1s' }}>
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
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">Discipline Score</h4>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-black text-gradient font-outfit">{stats.successRate}%</span>
                  <span className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 font-outfit">Ratio</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold opacity-40">Successes</span>
                    <span className="text-xs font-black text-emerald-500">{stats.successCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold opacity-40">Failures</span>
                    <span className="text-xs font-black text-rose-500">{stats.failureCount}</span>
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
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-50">System Logs</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-outfit">
                    <span className="opacity-40 uppercase">Protocol Version</span>
                    <span className="font-bold text-gradient">v4.1.0-PLATINUM</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="opacity-40 uppercase">Network</span>
                    <span className="font-bold text-white uppercase">Base Sepolia</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="container mt-auto py-6 border-t border-white/5">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px]">
          <div className="flex gap-6 uppercase font-bold tracking-widest">
            <a href={`https://sepolia.basescan.org/address/${STAKE_TO_DONE_ADDRESS}`} target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">Smart Contract</a>
            <a href={`https://sepolia.basescan.org/address/${MOCK_USDC_ADDRESS}`} target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">Token Audit</a>
          </div>
          <p className="opacity-20 uppercase font-black tracking-widest">Proprietary Protocol • 2026</p>
        </div>
      </footer>
    </div>
  )
}

export default App
