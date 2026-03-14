import { Target, Coins, PlusCircle } from 'lucide-react'
import { formatUnits } from 'viem'
import { motion } from 'framer-motion'
import { USDC_DECIMALS } from '../constants'

export const Hero = ({ usdcBalance, onMint, isMinting }) => {
  const balance = usdcBalance
    ? Number(formatUnits(usdcBalance, USDC_DECIMALS)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '0.00'

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
        PREMIUM RESTORATION.<br />
        <span className="grad">Protocol v1.2.7 Live.</span>
      </h2>

      <p className="hero-desc">
        A decentralized commitment protocol. Stake USDC on your tasks —
        complete on time to reclaim your funds, miss the deadline and they go
        to the treasury.
      </p>

      <div className="hero-stats-row">
        <motion.div className="hero-stat-card" whileHover={{ scale: 1.02 }}>
          <div className="hero-stat-icon"><Coins /></div>
          <div>
            <div className="hero-stat-val">{balance}</div>
            <div className="hero-stat-label">Available USDC</div>
          </div>
        </motion.div>

        <motion.button
          className="btn btn-primary btn-lg"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onMint}
          disabled={isMinting}
        >
          <PlusCircle />
          {isMinting ? 'Minting…' : 'Get Test USDC'}
        </motion.button>
      </div>
    </motion.div>
  )
}