import { Zap, Bell, ExternalLink } from 'lucide-react'
import { formatUnits } from 'viem'
import { STAKE_TO_DONE_ADDRESS, MOCK_USDC_ADDRESS } from '../constants'

export const Header = ({ address, isConnected, connect, disconnect, injected, isWrongChain, switchChain, baseSepolia, usdcBalance }) => {
  const formattedBalance = usdcBalance ? Number(formatUnits(usdcBalance, 18)).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00';
  
  return (
    <nav className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-sm font-black tracking-widest text-white m-0 uppercase line-height-1">STAKE-TO-DONE</h1>
            <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter">Live Sync</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={`https://sepolia.basescan.org/address/${STAKE_TO_DONE_ADDRESS}`} target="_blank" rel="noreferrer" className="text-[9px] opacity-40 hover:opacity-100 underline decoration-primary/30">Protocol Code</a>
            <a href={`https://sepolia.basescan.org/address/${MOCK_USDC_ADDRESS}`} target="_blank" rel="noreferrer" className="text-[9px] opacity-40 hover:opacity-100 underline decoration-primary/30">Asset Explorer</a>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isConnected ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="label-mini mb-0 text-[8px]">Protocol Assets</span>
              <span className="text-sm font-black text-white">
                {formattedBalance} <span className="text-primary text-[10px]">USDC</span>
              </span>
            </div>
            <div className="px-3 py-1.5 glass-card rounded-lg flex flex-col items-center border-primary/20">
              <span className="label-mini text-[8px] mb-0 opacity-50">Authorized</span>
              <span className="text-[10px] font-mono font-bold text-white">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
            <button
              onClick={() => disconnect()}
              className="btn-glass border-rose-500/20 text-rose-500 hover:bg-rose-500/10 font-bold text-[9px] uppercase tracking-widest px-3 py-1"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => connect({ connector: injected() })}
            className="btn-primary py-2 px-6 text-[10px] uppercase tracking-widest"
          >
            Authorize Protocol
          </button>
        )}
      </div>
    </nav>
  )
}

export const Toast = ({ showNotification, notificationMsg }) => (
  showNotification && (
    <div className="fixed top-6 right-6 z-50 animate-in">
      <div className="glass-card px-6 py-4 flex items-center gap-3 border-indigo-500/50 shadow-2xl shadow-indigo-500/20">
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <Bell className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="text-sm font-bold text-white">{notificationMsg}</p>
      </div>
    </div>
  )
)
