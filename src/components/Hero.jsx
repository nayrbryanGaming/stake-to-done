import { Target, Coins, PlusCircle } from 'lucide-react'
import { formatUnits } from 'viem'
import { motion } from 'framer-motion'
import { USDC_DECIMALS } from '../constants'

export const Hero = ({ usdcBalance, ethBalance, onMint, isMinting }) => {
  const balance = usdcBalance
    ? Number(formatUnits(usdcBalance, USDC_DECIMALS)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '0.00'

  const balanceEth = ethBalance
    ? Number(formatUnits(ethBalance, 18)).toLocaleString(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      })
    : '0.0000'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="card hero-card"
    >
      <div className="hero-bg-icon"><Target /></div>

      <div className="hero-pill">
        <div className="hero-pill-dot" />
        <span className="hero-pill-text">Base Sepolia Testnet</span>
      </div>

      <h2 className="hero-title">
        Master Your Time.<br />
        <span className="grad">Stake Your Goals.</span>
      </h2>

      <p className="hero-desc">
        A decentralized commitment protocol. Stake Mock USDC on your tasks —
        complete on time to reclaim your funds, miss the deadline and they go
        to the treasury.
      </p>

      <div className="hero-stats-row">
        <motion.div className="hero-stat-card" whileHover={{ scale: 1.02 }}>
          <div className="hero-stat-icon"><Coins /></div>
          <div>
            <div className="hero-stat-val">{balance}</div>
            <div className="hero-stat-label">Available Mock USDC</div>
          </div>
        </motion.div>

        <motion.div className="hero-stat-card" whileHover={{ scale: 1.02 }} style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="hero-stat-icon" style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}><Wallet /></div>
          <div>
            <div className="hero-stat-val">{balanceEth}</div>
            <div className="hero-stat-label">Gas ETH (from Faucet)</div>
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: 'auto' }}>
          <motion.button
            className="btn btn-primary btn-lg"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onMint}
            disabled={isMinting}
          >
            <PlusCircle />
            {isMinting ? 'Minting…' : 'Get Test Mock USDC'}
          </motion.button>
          <span style={{ fontSize: '0.55rem', color: 'var(--muted)', textAlign: 'center', fontWeight: 600 }}>
            * Use your gas ETH to mint Mock USDC
          </span>
        </div>
      </div>
    </motion.div>
  )
}