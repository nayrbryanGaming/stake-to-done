import { Target, Coins, PlusCircle, ShieldCheck } from 'lucide-react'
import { formatUnits } from 'viem'

export const Hero = ({ usdcBalance, handleMint, userTaskIds }) => (
  <div className="glass-card p-8 relative overflow-hidden">
    <div className="absolute top-4 right-4 opacity-5 pointer-events-none" style={{ transform: 'rotate(15deg)' }}>
      <Target className="w-32 h-32 sm:w-48 sm:h-48" />
    </div>

    <div className="relative-z-10 max-w-xl text-left">
      <div className="flex items-center gap-3 mb-6 bg-primary/10 w-fit px-3 py-1 rounded-full border border-primary/20">
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
        <span className="text-xs font-black tracking-widest text-primary uppercase">v6.0.0 ULTIMATE-ELITE</span>
      </div>

      <h2 className="text-2xl sm:text-4xl font-black mb-3 italic text-white uppercase tracking-tight leading-tight">
        Forge Your <span className="text-gradient">Resolve</span>.<br />
        Stake Your <span className="text-gradient">Future</span>.
      </h2>

      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-sm">
        Premium decentralized commitment protocol. Settle your goals on-chain with verified stakes.
      </p>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="glass-card bg-white/5 p-6 border-white/10 flex items-center gap-6 group hover:border-primary/50">
          <div className="icon-widget shadow-primary/20 bg-primary/20 group-hover:scale-110">
            <Coins className="text-white" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-outfit mb-1">
              {usdcBalance ? Number(formatUnits(usdcBalance, 18)).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
            </div>
            <div className="text-xs uppercase font-bold text-dim font-outfit tracking-widest">Protocol Assets</div>
          </div>
        </div>

        <button onClick={handleMint} className="btn-glass h-9 px-5 flex items-center border-primary-dim hover:border-primary">
          <PlusCircle className="w-3.5 h-3.5 mr-2 text-primary" />
          <span className="uppercase tracking-widest text-[8px] font-bold">Topup Liquidity</span>
        </button>
      </div>
    </div>
  </div>
)
