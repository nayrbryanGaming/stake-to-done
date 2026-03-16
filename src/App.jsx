import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// Stake-To-Done Protocol
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
import { motion } from 'framer-motion'
import { parseUnits, zeroAddress } from 'viem'
import {
  STAKE_TO_DONE_ADDRESS,
  STAKE_TO_DONE_ABI,
  USDC_ADDRESS,
  USDC_ABI,
  USDC_DECIMALS,
} from './constants'
import { Header, Toast, WalletModal } from './components/Layout'
import { Hero } from './components/Hero'
import { TaskForm } from './components/TaskForm'
import { TaskItem } from './components/TaskItem'

const TX_ACTION = {
  APPROVE_CREATE: 'approve_create',
  CREATE_TASK: 'create_task',
  MINT_USDC: 'mint_usdc',
}

function App() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({ hash })

  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [stakeAmount, setStakeAmount] = useState('10')
  const [searchQuery, setSearchQuery] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '' })
  const [pendingAction, setPendingAction] = useState(null)
  const [pendingCreatePayload, setPendingCreatePayload] = useState(null)

  const toastTimer = useRef(null)
  const lastHandledHash = useRef(null)

  const isWrongChain = isConnected && chainId !== baseSepolia.id
  const safeAddress = address ?? zeroAddress

  const showToast = (msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ show: true, msg })
    toastTimer.current = setTimeout(() => setToast({ show: false, msg: '' }), 4500)
  }

  // FORCE NETWORK SWITCH
  useEffect(() => {
    if (isConnected && isWrongChain) {
      const timer = setTimeout(() => {
        switchChain({ chainId: baseSepolia.id })
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isConnected, isWrongChain, switchChain])

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  useEffect(() => {
    if (isWrongChain) return // Don't spam errors if on wrong network
    if (writeError) showToast(writeError.shortMessage || writeError.message)
    if (txError) showToast(txError.shortMessage || txError.message)
  }, [writeError, txError, isWrongChain])

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

  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [safeAddress],
    query: {
      enabled: isConnected && !isWrongChain,
      refetchInterval: 5000,
    },
  })

  const { data: ethBalance, refetch: refetchEth } = useBalance({
    address: safeAddress,
    query: { enabled: isConnected && !isWrongChain, refetchInterval: 5000 },
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [safeAddress, STAKE_TO_DONE_ADDRESS],
    query: { enabled: isConnected && !isWrongChain },
  })

  const refetchAll = useCallback(() => {
    refetchIds()
    refetchTasks()
    refetchBalance()
    refetchAllowance()
    refetchEth()
  }, [refetchIds, refetchTasks, refetchBalance, refetchAllowance, refetchEth])

  const submitCreateAndStake = useCallback(({ cleanedDescription, deadlineTimestamp, amountWei }) => {
    writeContract({
      address: STAKE_TO_DONE_ADDRESS,
      abi: STAKE_TO_DONE_ABI,
      functionName: 'createAndStakeTask',
      args: [cleanedDescription, BigInt(deadlineTimestamp), amountWei],
      gas: 250000n,
    })
    setPendingAction(TX_ACTION.CREATE_TASK)
    setDescription('')
    setDeadline('')
  }, [writeContract])

  const handleCreateTask = (e) => {
    e.preventDefault()

    if (!isConnected) return showToast('Connect wallet first')
    if (isWrongChain) {
      switchChain({ chainId: baseSepolia.id })
      return showToast('Switching to Base Sepolia...')
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

      const amountWei = parseUnits(stakeAmount, USDC_DECIMALS)
      const payload = { cleanedDescription, deadlineTimestamp, amountWei }

      if ((allowance || 0n) < amountWei) {
        setPendingCreatePayload(payload)
        setPendingAction(TX_ACTION.APPROVE_CREATE)
        writeContract({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [STAKE_TO_DONE_ADDRESS, amountWei],
          gas: 80000n,
        })
        return showToast('Mock USDC approval submitted')
      }

      showToast('Submitting task...')
      submitCreateAndStake(payload)
    } catch {
      showToast('Invalid stake amount or deadline')
    }
  }

  const handleMint = () => {
    if (!isConnected) return showToast('Connect wallet first')
    if (isWrongChain) {
      switchChain({ chainId: baseSepolia.id })
      return showToast('Switching to Base Sepolia...')
    }

    setPendingAction(TX_ACTION.MINT_USDC)
    writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'mint',
      args: [safeAddress, parseUnits('1000', USDC_DECIMALS)],
      gas: 100000n,
    })
  }

  useEffect(() => {
    if (!isConfirmed || !hash || lastHandledHash.current === hash) return
    lastHandledHash.current = hash

    if (pendingAction === TX_ACTION.APPROVE_CREATE && pendingCreatePayload) {
      showToast('Approval confirmed, creating task...')
      submitCreateAndStake(pendingCreatePayload)
      setPendingCreatePayload(null)
      return
    }

    refetchAll()

    if (pendingAction === TX_ACTION.CREATE_TASK) {
      showToast('Task created and staked')
    } else if (pendingAction === TX_ACTION.MINT_USDC) {
      showToast('Mock USDC minted')
    } else {
      showToast('Transaction confirmed')
    }

    setPendingAction(null)
  }, [isConfirmed, hash, pendingAction, pendingCreatePayload, refetchAll, submitCreateAndStake])

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
      <div className="nuclear-locker">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="locker-content"
        >
          <div className="locker-icon">🚨</div>
          <h1 className="locker-title">BENTENG KEAMANAN AKTIF</h1>
          <p className="locker-desc">
            Metamask Anda sedang di <strong>Ethereum Mainnet (UANG ASLI)</strong>.<br/>
            Untuk menjaga uang Anda, <strong>Website ini saya KUNCI OTOMATIS</strong>.
          </p>
          <div className="locker-warning">
            <strong>KUNCI JAWABAN:</strong> Jika dompet minta bayar pakai dollar ($), itu karena networknya salah. <br/><br/>
            Begitu Anda klik tombol di bawah, simbol <strong>$</strong> akan hilang dan diganti koin <strong>Gratis</strong>.
          </div>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => switchChain({ chainId: baseSepolia.id })}
          >
            KLIK: PINDAH KE BASE SEPOLIA (GRATIS)
          </button>
          <p className="locker-footer">
            Jika sudah ganti network, Cari logo ungu <strong>V2.0.2 - FINAL FIX</strong> di pojok kiri atas sebagai bukti Anda sudah aman.
          </p>
        </motion.div>
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
        usdcBalance={usdcBalance}
        ethBalance={ethBalance?.value}
      />
      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />

      <Toast show={toast.show} msg={toast.msg} />

      <main className="container">
        <div className="main-grid">
          <section className="main-col">
            <Hero
              usdcBalance={usdcBalance}
              ethBalance={ethBalance?.value}
              onMint={handleMint}
              isMinting={isMintBusy}
            />
            {/* ... tasks controls and list ... */}
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
              <motion.div
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
              </motion.div>
            ) : displayTasks.length === 0 ? (
              <motion.div
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
              </motion.div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {displayTasks.map((task, index) => (
                  <motion.div
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
                  </motion.div>
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
              isTxPending={isFormBusy}
              isConfirming={isConfirming && isFormBusy}
              allowance={allowance}
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
            <a href={`https://sepolia.basescan.org/address/${USDC_ADDRESS}`} target="_blank" rel="noreferrer">
              Mock Token
            </a>
          </div>
          <p className="footer-copy">Stake-To-Done 2026</p>
        </div>
      </footer>
    </div>
  )
}

export default App
