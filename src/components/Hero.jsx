import { Target, Coins, Wallet } from 'lucide-react'
import { formatEther } from 'viem'
import { motion as Motion } from 'framer-motion'

export const Hero = ({ ethBalance }) => {
  const balanceEth = ethBalance
    ? Number(formatEther(ethBalance)).toLocaleString(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      })
    : '0.0000'

  return (
    <Motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="card hero-card"
    >
      <div className="hero-bg-icon"><Target /></div>

      <div className="hero-pill">
        <div className="hero-pill-dot" />
        <span className="hero-pill-text">Base Sepolia Testnet Only</span>
      </div>

      <h2 className="hero-title">
        Master Your Time.<br />
        <span className="grad">Stake Your Goals.</span>
      </h2>

      <p className="hero-desc">
        A decentralized commitment protocol. Stake <strong>Base Sepolia ETH</strong> on your tasks,
        complete on time to reclaim your funds, or let the stake expire to treasury.
        This application is intended for <strong>testnet usage</strong>.
      </p>

      <div className="hero-stats-row">
        <Motion.div className="hero-stat-card" whileHover={{ scale: 1.02 }} style={{ flex: 1 }}>
          <div className="hero-stat-icon" style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}><Wallet /></div>
          <div>
            <div className="hero-stat-val">{balanceEth}</div>
            <div className="hero-stat-label">BASE SEPOLIA ETH</div>
          </div>
        </Motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '2rem' }}>
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.72)', maxWidth: '210px', lineHeight: 1.45 }}>
            Faucet providers can change URLs at any time.
            Use any trusted Base Sepolia faucet available in your wallet/provider.
          </p>
        </div>
      </div>
    </Motion.div>
  )
}