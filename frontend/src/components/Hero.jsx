import { Target, Coins, PlusCircle, ShieldCheck } from 'lucide-react'
import { formatUnits } from 'viem'

export const Hero = ({ usdcBalance, handleMint, userTaskIds }) => (
  <div className="glass-card p-12 relative overflow-hidden animate-in" style={{ animationDelay: '0.2s' }}>
    <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]"></div>
    <div className="absolute top-12 right-12 opacity-5 scale-150 rotate-12">
      <Target className="w-64 h-64" />
    </div>

    <div className="relative z-10 max-w-2xl text-left">
      <div className="flex items-center gap-3 mb-8 bg-white/5 w-fit px-5 py-2 rounded-full border border-white/10 backdrop-blur-md">
        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Protocol Version 1.0.6 - BASE MVP</span>
      </div>

      <h2 className="text-6xl font-black mb-6 leading-[1.05] font-heading tracking-tight text-white">
        Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-glow">Time</span>,<br />
        Stake Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 text-glow">Goal</span>.
      </h2>

      <p className="text-gray-400 text-xl leading-relaxed mb-12 font-medium">
        Lock USDC on your commitments. Finish on time to reclaim your assets, fail and embrace the burn.
      </p>

      <div className="flex flex-wrap gap-6">
        <div className="glass-card bg-indigo-500/5 px-8 py-5 border-indigo-500/20 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-black tabular-nums text-white">
                {usdcBalance ? Number(formatUnits(usdcBalance, 18)).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
              </div>
              <div className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Available USDC</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleMint}
          className="btn-glass h-[74px] px-8 rounded-2xl font-bold flex items-center gap-3 hover:border-indigo-500/40 text-gray-300 hover:text-white transition-all"
        >
          <PlusCircle className="w-5 h-5 text-indigo-400" />
          <span>Get Test Funds</span>
        </button>

        <div className="glass-card bg-purple-500/5 px-8 py-5 border-purple-500/20 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-black tabular-nums text-white">
                {userTaskIds ? (userTaskIds.length * 10).toLocaleString() : '0'}
              </div>
              <div className="text-[10px] uppercase font-black text-gray-500 tracking-widest">TrustScore</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
