import { useEffect } from 'react'
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { formatEther } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Bell, X, ChevronRight, Wallet } from 'lucide-react'
import { STAKE_TO_DONE_ADDRESS, VERSION } from '../constants'

const WALLET_DESCS = {
  MetaMask: 'Browser extension & mobile wallet',
  Injected: 'Browser injected wallet',
  'Coinbase Wallet': 'Coinbase self-custody wallet',
}

/* ─── Header ────────────────────────────── */
export const Header = ({ onConnectClick, ethBalance }) => {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const fmtEth = ethBalance
    ? Number(formatEther(ethBalance)).toLocaleString(undefined, {
        minimumFractionDigits: 4, maximumFractionDigits: 4,
      })
    : '0.00'

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky-nav"
    >
      <div className="nav-inner">
        <div className="nav-logo">
          <motion.div className="logo-icon" whileHover={{ rotate: 12, scale: 1.08 }}>
            <Zap />
          </motion.div>
          <div className="logo-text">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="logo-name">STAKE-TO-DONE PROTOCOL</span>
              <span style={{ 
                background: 'var(--accent)', 
                color: '#fff', 
                fontSize: '0.45rem', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                fontWeight: 900,
                letterSpacing: '0.05em'
              }}>{VERSION}</span>
            </div>
            <span className="logo-sub">Proof of Commitment System</span>
          </div>
        </div>

        <div className="nav-links">
          <a href={`https://sepolia.basescan.org/address/${STAKE_TO_DONE_ADDRESS}`} target="_blank" rel="noreferrer">
            Contract
          </a>
        </div>

        <div className="nav-actions">
          {isConnected ? (
            <div className="wallet-info">
              <div className="wallet-balance">
                <span className="wallet-balance-label">WALLET (BASE SEPOLIA)</span>
                <span className="wallet-balance-value" style={{ color: 'var(--accent)' }}>{fmtEth} <span>ETH</span></span>
              </div>
              <div className="wallet-address">
                <span className="wallet-address-label">Wallet</span>
                <span className="wallet-address-value">
                  {address?.slice(0, 6)}…{address?.slice(-4)}
                </span>
              </div>
              <motion.button
                className="btn btn-glass btn-sm"
                style={{ borderColor: 'rgba(244,63,94,.2)', color: 'var(--error)' }}
                whileTap={{ scale: 0.96 }}
                onClick={() => disconnect()}
              >
                Disconnect
              </motion.button>
            </div>
          ) : (
            <motion.button
              className="btn btn-primary btn-md"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onConnectClick}
            >
              <Wallet /> Connect Wallet
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  )
}

/* ─── Wallet Modal ──────────────────────── */
export const WalletModal = ({ isOpen, onClose }) => {
  const { connect, connectors, isPending, error: connectError } = useConnect()
  const { isConnected } = useAccount()

  useEffect(() => {
    if (isConnected && isOpen) onClose()
  }, [isConnected, isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 24 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="modal-box"
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <div>
              <h2 className="modal-title">Connect Wallet</h2>
              <p className="modal-desc">Choose your preferred wallet to connect</p>
            </div>
            <button className="modal-close" onClick={onClose}><X /></button>
          </div>

          <div className="wallet-options">
            {connectors.map(connector => (
              <motion.button
                key={connector.uid}
                className="wallet-option"
                whileTap={{ scale: 0.98 }}
                disabled={isPending}
                onClick={() => connect({ connector })}
              >
                <div className="wallet-option-img">
                  {connector.icon
                    ? <img src={connector.icon} alt={connector.name} />
                    : <Wallet style={{ width: 24, height: 24, color: 'var(--primary)' }} />}
                </div>
                <div className="wallet-option-info">
                  <div className="wallet-option-name">{connector.name}</div>
                  <div className="wallet-option-desc">
                    {WALLET_DESCS[connector.name] ?? 'Connect with this wallet'}
                  </div>
                </div>
                {isPending
                  ? <div className="spinner-small" />
                  : <span className="wallet-option-arrow"><ChevronRight /></span>}
              </motion.button>
            ))}
          </div>

          {connectError && (
            <div className="wallet-error">
              {connectError.shortMessage || connectError.message}
            </div>
          )}

          <p style={{ marginTop:'1.2rem',fontSize:'.62rem',color:'var(--muted)',textAlign:'center',lineHeight:1.5 }}>
            Open-source protocol — only uses Base Sepolia Testnet.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── Toast ─────────────────────────────── */
export const Toast = ({ show, msg }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.9 }}
        className="toast-wrap"
      >
        <div className="toast">
          <div className="toast-icon"><Bell /></div>
          <p className="toast-msg">{msg}</p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)