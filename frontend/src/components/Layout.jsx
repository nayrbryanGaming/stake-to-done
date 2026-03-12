import { Zap, Bell } from 'lucide-react'
import { formatUnits } from 'viem'
import { motion as Motion, AnimatePresence as AnimatePresenceMotion } from 'framer-motion'
import { STAKE_TO_DONE_ADDRESS, USDC_ADDRESS, USDC_DECIMALS } from '../constants'

export const Header = ({ address, isConnected, connect, disconnect, injected, usdcBalance }) => {
  const formattedBalance = usdcBalance ? Number(formatUnits(usdcBalance, USDC_DECIMALS)).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00';
  
  return (
    <Motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4"
    >
      <div className="flex items-center gap-3">
        <Motion.div 
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="icon-widget w-12 h-12 bg-primary shadow-lg shadow-primary/30"
        >
          <Zap className="text-white" />
        </Motion.div>
        <div className="text-left">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-base font-black tracking-widest text-white m-0 uppercase line-height-1 font-outfit">STAKE-TO-DONE</h1>
            <div className="flex items-center gap-2 bg-success-dim px-2 py-1 rounded-full border border-success/10">
              <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
              <span className="text-[8px] font-bold text-success uppercase tracking-wider">Connected</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={`https://sepolia.basescan.org/address/${STAKE_TO_DONE_ADDRESS}`} target="_blank" rel="noreferrer" className="text-[9px] opacity-40 hover:opacity-100 underline decoration-primary">Contract</a>
            <a href={`https://sepolia.basescan.org/address/${USDC_ADDRESS}`} target="_blank" rel="noreferrer" className="text-[9px] opacity-40 hover:opacity-100 underline decoration-primary">Token</a>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isConnected ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="label-mini mb-0 text-[8px]">Wallet Balance</span>
              <span className="text-sm font-black text-white">
                {formattedBalance} <span className="text-primary text-[10px]">USDC</span>
              </span>
            </div>
            <Motion.div 
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 glass-card rounded-lg flex flex-col items-center border-primary/20"
            >
              <span className="label-mini text-[8px] mb-0 opacity-50">Address</span>
              <span className="text-[10px] font-mono font-bold text-white">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </Motion.div>
            <Motion.button
              whileHover={{ backgroundColor: 'rgba(244, 63, 94, 0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => disconnect()}
              className="btn-glass border-error-dim text-error font-bold text-[9px] uppercase tracking-widest px-3 py-1"
            >
              Disconnect
            </Motion.button>
          </div>
        ) : (
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => connect({ connector: injected() })}
            className="btn-primary py-2 px-6 text-[10px] uppercase tracking-widest"
          >
            Connect Wallet
          </Motion.button>
        )}
      </div>
    </Motion.nav>
  )
}

export const Toast = ({ showNotification, notificationMsg }) => (
  <AnimatePresenceMotion>
    {showNotification && (
      <Motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 pointer-events-none"
      >
        <div className="glass-card px-6 py-4 flex items-center gap-3 border-primary-dim shadow-premium bg-black/80">
          <div className="w-8 h-8 rounded-full bg-primary-dim flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-bold text-white">{notificationMsg}</p>
        </div>
      </Motion.div>
    )}
  </AnimatePresenceMotion>
)
