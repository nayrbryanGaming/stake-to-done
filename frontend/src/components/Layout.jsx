import { Zap, Bell } from 'lucide-react'

export const Header = ({ address, isConnected, connect, disconnect, injected, isWrongChain, switchChain, baseSepolia }) => (
  <nav className="flex justify-between items-center py-8 mb-12 animate-in" style={{ animationDelay: '0.1s' }}>
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 btn-primary rounded-2xl flex items-center justify-center shadow-indigo-500/40">
        <Zap className="w-8 h-8 text-white fill-white animate-pulse" />
      </div>
      <div className="text-left">
        <h1 className="text-3xl font-black font-heading tracking-tighter text-white leading-none">STAKE-TO-DONE</h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-1">Proof of Commitment • v1.1.0</p>
      </div>
    </div>

    <div className="flex items-center gap-6">
      {isConnected ? (
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end text-right">
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
          <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform shadow-xl shadow-indigo-600/30" /> Connect Protocol
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
