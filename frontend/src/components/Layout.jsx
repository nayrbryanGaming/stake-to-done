import { Zap, Bell } from 'lucide-react'

export const Header = ({ address, isConnected, connect, disconnect, injected, isWrongChain, switchChain, baseSepolia }) => (
  <nav className="flex justify-between items-center py-8 mb-12 animate-in" style={{ animationDelay: '0.1s' }}>
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[20px] flex items-center justify-center shadow-2xl shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-500">
        <Zap className="w-7 h-7 text-white fill-white/20" />
      </div>
      <div>
        <h1 className="text-2xl font-black tracking-tighter leading-none font-heading text-white">STAKE-TO-DONE</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-indigo-400/80">Base Sepolia Sync Active</p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-6">
      {isConnected ? (
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Staking Wallet</span>
            <span className="text-sm font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
          <button
            onClick={() => disconnect()}
            className="w-12 h-12 glass-card flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-all active:scale-90"
            title="Disconnect"
          >
            <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => connect({ connector: injected() })}
          className="btn-primary h-14 px-8 rounded-2xl font-black flex items-center gap-3 text-white group"
        >
          <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Connect Protocol
        </button>
      )}
    </div>
  </nav>
)

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
