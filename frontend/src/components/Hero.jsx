import { Target, Coins, PlusCircle, ShieldCheck } from 'lucide-react'
import { formatUnits } from 'viem'

export const Hero = ({ usdcBalance, handleMint, userTaskIds }) => (
  <div className="glass-card p-8 relative overflow-hidden">
    <div className="absolute top-4 right-4 opacity-5 pointer-events-none" style={{ transform: 'rotate(15deg)' }}>
      <Target className="w-32 h-32 sm:w-48 sm:h-48" />
    </div>

    <div className="relative-z-10 max-w-xl text-left">
      <div className="hero-tag mb-4 flex items-center gap-2">
        <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
        <span className="text-[9px] uppercase font-bold tracking-widest text-primary opacity-80">v4.0.0 PERFECTION MVP</span>
      </div>

      <h2 className="text-2xl sm:text-4xl font-black mb-3 italic text-white uppercase tracking-tight leading-tight">
        Forge Your <span className="text-gradient">Resolve</span>.<br />
        Stake Your <span className="text-gradient">Future</span>.
      </h2>

      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-sm">
        Premium decentralized commitment protocol. Settle your goals on-chain with verified stakes.
      </p>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="glass-card bg-white/5 px-5 py-3 border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-black text-white font-outfit">
              {usdcBalance ? Number(formatUnits(usdcBalance, 18)).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
            </div>
            <div className="text-[9px] uppercase font-bold opacity-40 font-outfit tracking-widest">USDC LIQUIDITY</div>
          </div>
        </div>

        <button onClick={handleMint} className="btn-glass h-9 px-5 flex items-center border-primary/20 hover:border-primary/50">
          <PlusCircle className="w-3.5 h-3.5 mr-2 text-primary" />
          <span className="uppercase tracking-widest text-[8px] font-bold">Hydrate Wallet</span>
        </button>
      </div>
    </div>
  </div>
)
