import { Zap, LayoutDashboard, ArrowRight } from 'lucide-react'

export const TaskForm = ({ description, setDescription, deadline, setDeadline, stakeAmount, setStakeAmount, handleCreateTask, isConnected, isTxPending, isConfirming }) => (
  <div className="glass-card flex flex-col p-6 sm:p-8 border-primary/20 animate-in" style={{ animationDelay: '0.5s' }}>
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-xl font-black flex items-center gap-4 text-white font-outfit">
        <div className="icon-widget h-12 w-12 bg-primary/10">
          <Zap className="text-primary" />
        </div>
        Initialize Goal
      </h3>
    </div>

    <form onSubmit={handleCreateTask} className="space-y-8 text-left">
      <div className="space-y-3">
        <label className="label-mini">Objective Definition</label>
        <input
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter commitment objective..."
          className="input-field border-primary-dim"
        />
      </div>

      <div className="space-y-3">
        <label className="label-mini">Resolution Horizon</label>
        <input
          type="datetime-local"
          required
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="input-field"
          style={{ colorScheme: 'dark' }}
        />
      </div>

      <div className="space-y-3">
        <label className="label-mini">Staked liquidity (USDC)</label>
        <div className="relative">
          <input
            type="number"
            required
            step="0.01"
            min="0"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="0.00"
            className="input-field border-primary-dim"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!isConnected || isTxPending || isConfirming}
          className="w-full btn-primary py-4 text-base shadow-premium"
        >
          <span>{isConfirming ? 'FINALIZING...' : 'START PROTOCOL'}</span>
          <ArrowRight className="w-5 h-5 ml-3" />
        </button>
      </div>
    </form>
  </div>
)
