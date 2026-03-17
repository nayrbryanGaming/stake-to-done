import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// Stake-To-Done Protocol (Pure ETH Version)
import {
  useAccount,
  useReadContract,
  usePublicClient,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
  useBalance,
} from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { Search, Clock, Wallet } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
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

const TASK_READ_CHUNK_SIZE = 20
const BASE_SEPOLIA_CHAIN_HEX = `0x${baseSepolia.id.toString(16)}`
const BASE_SEPOLIA_CHAIN_PARAMS = {
  chainId: BASE_SEPOLIA_CHAIN_HEX,
  chainName: 'Base Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: [
    'https://sepolia.base.org',
    'https://base-sepolia-rpc.publicnode.com',
    'https://base-sepolia.blockpi.network/v1/rpc/public',
  ],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
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

const readTaskFlag = (task, key, index) => Boolean(task?.[key] ?? task?.[index])

function App() {
  const { address, isConnected, connector } = useAccount()
  const publicClient = usePublicClient({ chainId: baseSepolia.id })
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
  const lastTaskLoadWarning = useRef('')

  const isWrongChain = isConnected && chainId !== baseSepolia.id
  const safeAddress = address ?? zeroAddress

  const showToast = useCallback((msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ show: true, msg })
    toastTimer.current = setTimeout(() => setToast({ show: false, msg: '' }), 4500)
  }, [])

  const switchProviderToBaseSepolia = useCallback(async (provider) => {
    if (!provider?.request) return false

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CHAIN_HEX }],
      })
      return true
    } catch (error) {
      const code = error?.code
      const msg = (error?.message || '').toLowerCase()
      const needsAddChain = code === 4902 || msg.includes('unrecognized chain') || msg.includes('unknown chain')
      if (!needsAddChain) return false

      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [BASE_SEPOLIA_CHAIN_PARAMS],
        })
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BASE_SEPOLIA_CHAIN_HEX }],
        })
        return true
      } catch {
        return false
      }
    }
  }, [])

  const handleSwitchToBaseSepolia = useCallback(async () => {
    try {
      const provider = await connector?.getProvider?.()
      const switchedByProvider = await switchProviderToBaseSepolia(provider)
      if (switchedByProvider) return true

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
  }, [connector, showToast, switchChain, switchChainAsync, switchProviderToBaseSepolia])

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
  const taskIdsKey = useMemo(() => taskIds.map((id) => id.toString()).join(','), [taskIds])

  const { data: taskQueryData, isLoading: isTasksQueryLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['user-tasks-chunked', safeAddress, chainId, taskIdsKey],
    enabled: isConnected && !isWrongChain && !!publicClient && taskIds.length > 0,
    staleTime: 5000,
    queryFn: async () => {
      const loaded = []
      let failedReads = 0

      for (let i = 0; i < taskIds.length; i += TASK_READ_CHUNK_SIZE) {
        const chunk = taskIds.slice(i, i + TASK_READ_CHUNK_SIZE)
        const results = await Promise.all(
          chunk.map(async (id) => {
            try {
              return await publicClient.readContract({
                address: STAKE_TO_DONE_ADDRESS,
                abi: STAKE_TO_DONE_ABI,
                functionName: 'tasks',
                args: [id],
              })
            } catch {
              failedReads += 1
              return null
            }
          }),
        )

        for (const task of results) {
          if (task) loaded.push(task)
        }
      }

      return {
        tasks: loaded,
        failedReads,
        total: taskIds.length,
      }
    },
  })

  const userTasks = useMemo(() => {
    if (!isConnected || isWrongChain || taskIds.length === 0) return []
    return taskQueryData?.tasks || []
  }, [isConnected, isWrongChain, taskIds.length, taskQueryData])

  const tasksLoading = isConnected && !isWrongChain && taskIds.length > 0 && isTasksQueryLoading

  useEffect(() => {
    const failedReads = taskQueryData?.failedReads || 0
    const total = taskQueryData?.total || 0
    if (failedReads === 0 || total === 0) return

    const warningKey = `${failedReads}/${total}/${taskIdsKey}`
    if (lastTaskLoadWarning.current === warningKey) return
    lastTaskLoadWarning.current = warningKey

    const timer = setTimeout(() => {
      showToast(`Loaded ${total - failedReads}/${total} tasks. Retry if some tasks are still missing.`)
    }, 0)

    return () => clearTimeout(timer)
  }, [showToast, taskIdsKey, taskQueryData])

  const { data: ethBalance, refetch: refetchEth } = useBalance({
    address: safeAddress,
    query: { enabled: isConnected && !isWrongChain, refetchInterval: 5000 },
  })

  const refetchAll = useCallback(() => {
    void refetchIds()
    void refetchTasks()
    void refetchEth()
  }, [refetchEth, refetchIds, refetchTasks])

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

    const refetchTimer = setTimeout(() => {
      refetchAll()
    }, 0)

    const successMsg = pendingAction === TX_ACTION.CREATE_TASK
      ? 'Task created and staked (Pure ETH)'
      : 'Transaction confirmed'

    const timer = setTimeout(() => {
      showToast(successMsg)
      setPendingAction(null)
    }, 0)

    return () => {
      clearTimeout(refetchTimer)
      clearTimeout(timer)
    }

  }, [isConfirmed, hash, pendingAction, refetchAll, showToast])

  const allTasks = useMemo(() => [...(userTasks || [])].reverse(), [userTasks])
  const activeTasks = useMemo(() => allTasks.filter((t) => !readTaskFlag(t, 'completed', 5) && !readTaskFlag(t, 'claimed', 6)), [allTasks])
  const historyTasks = useMemo(() => allTasks.filter((t) => readTaskFlag(t, 'completed', 5) || readTaskFlag(t, 'claimed', 6)), [allTasks])
  const displayTasks = showHistory ? historyTasks : activeTasks

  const completedCount = useMemo(() => allTasks.filter((t) => readTaskFlag(t, 'completed', 5)).length, [allTasks])
  const failedCount = useMemo(() => allTasks.filter((t) => readTaskFlag(t, 'claimed', 6) && !readTaskFlag(t, 'completed', 5)).length, [allTasks])
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
            ) : tasksLoading ? (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card empty-state"
              >
                <div className="empty-state-icon">
                  <Clock />
                </div>
                <h4 className="empty-state-title">Loading tasks...</h4>
                <p className="empty-state-desc">Fetching on-chain tasks from Base Sepolia.</p>
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
