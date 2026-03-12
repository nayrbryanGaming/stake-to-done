import { Target, Coins, PlusCircle } from 'lucide-react'
import { formatUnits } from 'viem'
import { motion as Motion } from 'framer-motion'
import { USDC_DECIMALS } from '../constants'

export const Hero = ({ usdcBalance, handleMint }) => (
  <Motion.div 
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8 }}
    className="glass-card p-8 relative overflow-hidden"
  >
    <div className="absolute top-4 right-4 opacity-5 pointer-events-none" style={{ transform: 'rotate(15deg)' }}>
      <Target className="w-32 h-32 sm:w-48 sm:h-48" />
    </div>

    <div className="relative-z-10 max-w-xl text-left">
      <Motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 mb-6 bg-primary/10 w-fit px-3 py-1 rounded-full border border-primary/20"
      >
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
        <span className="text-xs font-black tracking-widest text-primary uppercase">Base Sepolia</span>
      </Motion.div>

      <Motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-2xl sm:text-4xl font-black mb-3 italic text-white uppercase tracking-tight leading-tight"
      >
        Define Your <span className="text-gradient">Goals</span>.<br />
        Secure Your <span className="text-gradient">Commitment</span>.
      </Motion.h2>

      <Motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-400 text-base sm:text-lg leading-relaxed mb-10 max-w-lg font-medium opacity-70"
      >
        A decentralized commitment protocol for goal-oriented individuals. 
        Secure your objectives on-chain with verifiable stakes.
      </Motion.p>

      <div className="flex flex-col md:flex-row gap-12 items-center">
        <Motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass-card bg-white/5 p-8 border-white/10 flex items-center gap-10 group hover:border-primary/60 animate-float-pro shadow-premium"
        >
          <div className="icon-widget shadow-primary/40 bg-primary/20 group-hover:rotate-[15deg] transition-all">
            <Coins className="text-white" />
          </div>
          <div>
            <div className="text-5xl font-black text-white font-outfit mb-3 tracking-tighter">
              {usdcBalance ? Number(formatUnits(usdcBalance, USDC_DECIMALS)).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
            </div>
            <div className="text-sm uppercase font-black text-primary font-outfit tracking-[0.3em]">Wallet USDC</div>
          </div>
        </Motion.div>

        <Motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMint} 
          className="btn-primary h-16 px-10 flex items-center border-primary-dim shadow-premium transition-all"
        >
          <PlusCircle className="w-6 h-6 mr-3 text-white" />
          <span className="uppercase tracking-[0.2em] text-sm font-black">Mint Test USDC</span>
        </Motion.button>
      </div>
    </div>
  </Motion.div>
)
