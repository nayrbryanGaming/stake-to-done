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
  const [searchQuery, setSearchQuery] = useState('')
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

  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: MOCK_USDC_ADDRESS,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address && !isWrongChain }
  })

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
    if (isWrongChain) return switchChain({ chainId: baseSepolia.id })

    try {
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000)
      if (deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
        return notify('Deadline must be in the future')
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

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden selection:bg-indigo-500/30">
      <div className="mesh-bg">
        <div className="mesh-circle c-1"></div>
        <div className="mesh-circle c-2"></div>
      </div>

      {isWrongChain && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white py-2 z-[60] text-center text-xs font-black uppercase tracking-widest animate-pulse">
          Wrong Network. Switch to Base Sepolia to continue protocol enforcement.
          <button onClick={() => switchChain({ chainId: baseSepolia.id })} className="ml-4 underline">Switch Now</button>
        </div>
      )}

      <Toast showNotification={showNotification} notificationMsg={notificationMsg} />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <Header 
          address={address} 
          isConnected={isConnected} 
          connect={connect} 
          disconnect={disconnect} 
          injected={injected} 
          isWrongChain={isWrongChain} 
          switchChain={switchChain} 
          baseSepolia={baseSepolia} 
        />

        <main className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <Hero usdcBalance={usdcBalance} handleMint={handleMint} userTaskIds={userTaskIds} />

            <div className="flex flex-col sm:flex-row justify-between items-end gap-6 animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-left">
                <h3 className="text-4xl font-black font-heading tracking-tight mb-2 flex items-center gap-4 text-white">
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
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 text-sm focus:border-indigo-500/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-gray-700 font-bold text-white"
                />
              </div>
            </div>

            <div className="animate-in space-y-6" style={{ animationDelay: '0.4s' }}>
              {!isConnected ? (
                <div className="glass-card p-24 text-center border-dashed border-2 bg-transparent">
                  <Wallet className="w-12 h-12 text-indigo-400 mx-auto mb-8" />
                  <h4 className="text-2xl font-black mb-3 text-white uppercase tracking-tight">Connect Protocol</h4>
                  <button onClick={() => connect({ connector: injected() })} className="btn-primary h-14 px-8 rounded-2xl font-black text-white mx-auto">Authorize Wallet</button>
                </div>
              ) : userTaskIds?.length === 0 ? (
                <div className="glass-card p-24 text-center border-dashed border-2 bg-transparent">
                  <Clock className="w-12 h-12 text-gray-700 mx-auto mb-8" />
                  <h4 className="text-2xl font-black mb-3 text-gray-400 uppercase tracking-tight">No Commitments</h4>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...userTaskIds || []].reverse().map(id => (
                    <TaskItem key={id.toString()} id={id} searchQuery={searchQuery} notify={notify} refetchAll={() => { refetchIds(); refetchBalance(); }} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8 sticky top-10 h-fit">
            <TaskForm 
              description={description} 
              setDescription={setDescription} 
              deadline={deadline} 
              setDeadline={setDeadline} 
              handleCreateTask={handleCreateTask} 
              isConnected={isConnected} 
              isTxPending={isTxPending} 
              isConfirming={isConfirming} 
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
