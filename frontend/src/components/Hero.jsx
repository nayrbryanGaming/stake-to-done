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

      <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-10 max-w-lg font-medium opacity-70">
        The definitive decentralized commitment protocol for high-performance builders. 
        Secure your resolve on-chain with military-grade stakes.
      </p>

      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="glass-card bg-white/5 p-8 border-white/10 flex items-center gap-10 group hover:border-primary/60 animate-float-pro shadow-premium">
          <div className="icon-widget shadow-primary/40 bg-primary/20 group-hover:rotate-[15deg] transition-all">
            <Coins className="text-white" />
          </div>
          <div>
            <div className="text-5xl font-black text-white font-outfit mb-3 tracking-tighter">
              {usdcBalance ? Number(formatUnits(usdcBalance, 18)).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
            </div>
            <div className="text-sm uppercase font-black text-primary font-outfit tracking-[0.3em]">Protocol Treasury Assets</div>
          </div>
        </div>

        <button onClick={handleMint} className="btn-primary h-16 px-10 flex items-center border-primary-dim hover:scale-110 active:scale-95 transition-all">
          <PlusCircle className="w-6 h-6 mr-3 text-white" />
          <span className="uppercase tracking-[0.2em] text-sm font-black">Infuse Liquidity</span>
        </button>
      </div>
    </div>
  </div>
)
