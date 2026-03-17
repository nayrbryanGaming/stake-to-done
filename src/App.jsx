import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// Stake-To-Done Protocol (Pure ETH Version)
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
  useBalance,
} from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { Search, Clock, Wallet } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import { parseEther, zeroAddress } from 'viem'
import {
  STAKE_TO_DONE_ADDRESS,
  STAKE_TO_DONE_ABI,
} from './constants'
import { Header, Toast, WalletModal } from './components/Layout'
import { Hero } from './components/Hero'
import { TaskForm } from './components/TaskForm'
import { TaskItem } from './components/TaskItem'

const TX_ACTION = {
  CREATE_TASK: 'create_task',
}

const normalizeChainId = (rawChainId) => {
  if (rawChainId == null) return null
  if (typeof rawChainId === 'number' && Number.isFinite(rawChainId)) return rawChainId
  if (typeof rawChainId !== 'string') return null

  if (rawChainId.startsWith('0x')) {
    const parsed = Number.parseInt(rawChainId, 16)
    return Number.isFinite(parsed) ? parsed : null
  }

  const parsed = Number.parseInt(rawChainId, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function App() {
  const { address, isConnected, connector } = useAccount()
  const chainId = useChainId()
  const { switchChain, switchChainAsync } = useSwitchChain()
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash })

  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [stakeAmount, setStakeAmount] = useState('0.001')
  const [searchQuery, setSearchQuery] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '' })
  const [pendingAction, setPendingAction] = useState(null)

  const toastTimer = useRef(null)
  const lastHandledHash = useRef(null)

  const isWrongChain = isConnected && chainId !== baseSepolia.id
  const safeAddress = address ?? zeroAddress

  const showToast = useCallback((msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ show: true, msg })
    toastTimer.current = setTimeout(() => setToast({ show: false, msg: '' }), 4500)
  }, [])

  const handleSwitchToBaseSepolia = useCallback(async () => {
    try {
      if (typeof switchChainAsync === 'function') {
        await switchChainAsync({ chainId: baseSepolia.id })
      } else {
        switchChain?.({ chainId: baseSepolia.id })
      }
      return true
    } catch {
      showToast('Failed to switch network automatically. Switch manually in wallet settings.')
      return false
    }
  }, [showToast, switchChain, switchChainAsync])

  const getProviderChainId = useCallback(async () => {
    try {
      const provider = await connector?.getProvider?.()
      if (!provider?.request) return null
      const rawChainId = await provider.request({ method: 'eth_chainId' })
      return normalizeChainId(rawChainId)
    } catch {
      return null
    }
  }, [connector])

  const ensureBaseSepoliaNetwork = useCallback(async () => {
    const providerChainId = await getProviderChainId()
    const detectedChainId = providerChainId ?? chainId

    if (detectedChainId === baseSepolia.id) return true

    const switched = await handleSwitchToBaseSepolia()
    if (!switched) return false

    const afterSwitchChainId = await getProviderChainId()
    if (afterSwitchChainId != null && afterSwitchChainId !== baseSepolia.id) {
      showToast(`Wallet chain is still ${afterSwitchChainId}. Approve Base Sepolia switch in wallet.`)
      return false
    }

    return true
  }, [chainId, getProviderChainId, handleSwitchToBaseSepolia, showToast])

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  useEffect(() => {
    if (isWrongChain) return 
    const msg = writeError?.shortMessage || writeError?.message || txError?.shortMessage || txError?.message
    if (!msg) return

    const timer = setTimeout(() => {
      showToast(msg)
    }, 0)

    return () => clearTimeout(timer)
  }, [writeError, txError, isWrongChain, showToast])

  const { data: userTaskIds, refetch: refetchIds } = useReadContract({
    address: STAKE_TO_DONE_ADDRESS,
    abi: STAKE_TO_DONE_ABI,
    functionName: 'getUserTasks',
    args: [safeAddress],
    query: { enabled: isConnected && !isWrongChain },
  })

  const taskIds = useMemo(() => userTaskIds || [], [userTaskIds])

  const { data: userTasks, refetch: refetchTasks } = useReadContract({
    address: STAKE_TO_DONE_ADDRESS,
    abi: STAKE_TO_DONE_ABI,
    functionName: 'getTaskDetails',
    args: [taskIds],
    query: { enabled: isConnected && !isWrongChain && taskIds.length > 0 },
  })

  const { data: ethBalance, refetch: refetchEth } = useBalance({
    address: safeAddress,
    query: { enabled: isConnected && !isWrongChain, refetchInterval: 5000 },
  })

  const refetchAll = useCallback(() => {
    refetchIds()
    refetchTasks()
    refetchEth()
  }, [refetchIds, refetchTasks, refetchEth])

  const handleCreateTask = async (e) => {
    e.preventDefault()

    if (!isConnected || !address) return showToast('Connect wallet first')
    const onTargetNetwork = await ensureBaseSepoliaNetwork()
    if (!onTargetNetwork) {
      return showToast('Wallet must be on Base Sepolia (84532).')
    }

    const cleanedDescription = description.trim()
    if (!cleanedDescription) return showToast('Task description is required')
    if (!deadline) return showToast('Deadline is required')
    if (!stakeAmount || Number(stakeAmount) <= 0) return showToast('Stake amount must be greater than zero')

    try {
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000)
      if (!Number.isFinite(deadlineTimestamp) || deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
        return showToast('Deadline must be in the future')
      }

      const amountWei = parseEther(stakeAmount)
      
      showToast('Submitting task...')
      writeContract({
        chainId: baseSepolia.id,
        account: address,
        address: STAKE_TO_DONE_ADDRESS,
        abi: STAKE_TO_DONE_ABI,
        functionName: 'createAndStakeTask',
        args: [cleanedDescription, BigInt(deadlineTimestamp)],
        value: amountWei,
      })
      
      setPendingAction(TX_ACTION.CREATE_TASK)
      setDescription('')
      setDeadline('')
    } catch (error) {
      const msg = error?.shortMessage || error?.message
      showToast(msg || 'Invalid stake amount or deadline')
    }
  }

  useEffect(() => {
    if (!isConfirmed || !hash || lastHandledHash.current === hash) return
    lastHandledHash.current = hash

    refetchAll()

    const successMsg = pendingAction === TX_ACTION.CREATE_TASK
      ? 'Task created and staked (Pure ETH)'
      : 'Transaction confirmed'

    const timer = setTimeout(() => {
      showToast(successMsg)
      setPendingAction(null)
    }, 0)

    return () => clearTimeout(timer)

  }, [isConfirmed, hash, pendingAction, refetchAll, showToast])

  const allTasks = useMemo(() => [...(userTasks || [])].reverse(), [userTasks])
  const activeTasks = useMemo(() => allTasks.filter((t) => !t.completed && !t.claimed), [allTasks])
  const historyTasks = useMemo(() => allTasks.filter((t) => t.completed || t.claimed), [allTasks])
  const displayTasks = showHistory ? historyTasks : activeTasks

  const completedCount = useMemo(() => allTasks.filter((t) => t.completed).length, [allTasks])
  const failedCount = useMemo(() => allTasks.filter((t) => t.claimed && !t.completed).length, [allTasks])
  const settledCount = completedCount + failedCount
  const successRate = settledCount > 0 ? Math.round((completedCount / settledCount) * 100) : 0

  if (isWrongChain) {
    return (
      <div className="network-guard">
        <Motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="guard-content"
          style={{ border: '1px solid rgba(244, 63, 94, 0.3)', background: 'rgba(7, 7, 13, 0.95)', position: 'relative' }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--error), var(--primary))' }} />
          <div className="guard-icon" style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>🛡️</div>
          <h1 className="guard-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Wrong Network Detected</h1>
          
          <p className="guard-desc" style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '1.5rem', fontWeight: 700 }}>
            This app only runs on Base Sepolia testnet.
          </p>

          <div className="guard-warning" style={{ background: 'rgba(244, 63, 94, 0.1)', borderLeft: '4px solid var(--error)', color: 'var(--error)', padding: '1.5rem', textAlign: 'left', borderRadius: '12px', marginBottom: '2rem' }}>
            <div style={{ fontWeight: 900, marginBottom: '0.5rem' }}>⚠️ Network mismatch</div>
            Your wallet is currently connected to another chain.
            <br />
            Switch to <strong>Base Sepolia (Chain ID 84532)</strong> to continue.
            {chainId != null && chainId !== baseSepolia.id && (
              <>
                <br />
                Detected wallet chain: <strong>{chainId}</strong>
              </>
            )}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', lineHeight: '1.7', fontSize: '0.9rem' }}>
            Base Sepolia uses testnet ETH for gas.
            In the wallet popup, network must show Base Sepolia before confirming.
          </p>

          <button 
            className="btn btn-primary btn-lg"
            style={{ width: '100%', padding: '1.4rem', fontSize: '1.1rem', borderRadius: '16px' }}
            onClick={() => {
              void handleSwitchToBaseSepolia()
            }}
          >
            Switch to Base Sepolia
          </button>
          
          <p className="guard-footer" style={{ marginTop: '2rem', fontWeight: 700, opacity: 0.6 }}>
            Supported network: <strong>Base Sepolia</strong>
          </p>
        </Motion.div>
      </div>
    )
  }

  return (
    <div className="app-wrapper">
      <div className="mesh-bg">
        <div className="mesh-circle c-1" />
        <div className="mesh-circle c-2" />
        <div className="mesh-circle c-3" />
      </div>
      <Header
        onConnectClick={() => setShowWalletModal(true)}
        ethBalance={ethBalance?.value}
      />
      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />

      <Toast show={toast.show} msg={toast.msg} />

      <main className="container">
        <div className="main-grid">
          <section className="main-col">
            <Hero
              ethBalance={ethBalance?.value}
            />
            
            <div className="tasks-controls">
              <div className="tasks-controls-left">
                <h3 className="tasks-heading">
                  Tasks <span>{displayTasks.length}</span>
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className={`tasks-tab-btn ${!showHistory ? 'active' : 'inactive'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setShowHistory(true)}
                  className={`tasks-tab-btn ${showHistory ? 'active' : 'inactive'}`}
                >
                  History
                </button>
              </div>

              <div className="search-wrap">
                <Search />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search task..."
                  className="search-input"
                />
              </div>
            </div>

            {!isConnected ? (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card empty-state"
              >
                <div className="empty-state-icon">
                  <Wallet />
                </div>
                <h4 className="empty-state-title">Connect wallet</h4>
                <p className="empty-state-desc">Connect your wallet to create, stake, and manage your tasks.</p>
                <button className="btn btn-primary btn-sm" onClick={() => setShowWalletModal(true)}>
                  Connect Wallet
                </button>
              </Motion.div>
            ) : displayTasks.length === 0 ? (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card empty-state"
              >
                <div className="empty-state-icon">
                  <Clock />
                </div>
                <h4 className="empty-state-title">{showHistory ? 'No history yet' : 'No active tasks'}</h4>
                <p className="empty-state-desc">
                  {showHistory
                    ? 'Complete or expire tasks to see history here.'
                    : 'Create your first commitment from the form on the right.'}
                </p>
              </Motion.div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {displayTasks.map((task, index) => (
                  <Motion.div
                    key={task.id.toString()}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <TaskItem
                      id={task.id}
                      initialTask={task}
                      searchQuery={searchQuery}
                      notify={showToast}
                      refetchAll={refetchAll}
                    />
                  </Motion.div>
                ))}
              </div>
            )}
          </section>

          <aside className="sidebar-col">
            <TaskForm
              description={description}
              setDescription={setDescription}
              deadline={deadline}
              setDeadline={setDeadline}
              stakeAmount={stakeAmount}
              setStakeAmount={setStakeAmount}
              onSubmit={handleCreateTask}
              isConnected={isConnected}
              isTxPending={isWritePending}
              isConfirming={isConfirming}
            />

            <div className="card stats-card">
              <h4 className="stats-title">Summary</h4>
              <div className="stats-rate">
                <span className="stats-rate-val">{successRate}%</span>
                <span className="stats-rate-label">Success rate</span>
              </div>

              <div className="stats-progress">
                <div className="stats-progress-bar" style={{ width: `${successRate}%` }} />
              </div>

              <div className="stats-rows">
                <div className="stats-row">
                  <span className="stats-row-label">Completed</span>
                  <span className="stats-row-val" style={{ color: 'var(--success)' }}>{completedCount}</span>
                </div>
                <div className="stats-row">
                  <span className="stats-row-label">Expired</span>
                  <span className="stats-row-val" style={{ color: 'var(--error)' }}>{failedCount}</span>
                </div>
                <div className="stats-row">
                  <span className="stats-row-label">Active</span>
                  <span className="stats-row-val" style={{ color: 'var(--text)' }}>{activeTasks.length}</span>
                </div>
              </div>
            </div>

            <div className="card network-card">
              <h4 className="network-title">Network</h4>
              <div className="network-rows">
                <div className="network-row">
                  <span className="network-row-label">Chain</span>
                  <span className="network-row-val gradient-text">Base Sepolia</span>
                </div>
                <div className="network-row">
                  <span className="network-row-label">Status</span>
                  <span className="network-row-val">Live</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-links">
            <a href={`https://sepolia.basescan.org/address/${STAKE_TO_DONE_ADDRESS}`} target="_blank" rel="noreferrer">
              Contract
            </a>
          </div>
          <p className="footer-copy">Stake-To-Done Protocol &copy; 2026 • Built for Base</p>
        </div>
      </footer>
    </div>
  )
}

export default App
