import { Zap, LayoutDashboard, ArrowRight } from 'lucide-react'

export const TaskForm = ({ description, setDescription, deadline, setDeadline, stakeAmount, setStakeAmount, handleCreateTask, isConnected, isTxPending, isConfirming }) => (
  <div className="glass-card p-6 sm:p-8 bg-indigo-500-10 border-indigo-500-20 animate-in" style={{ animationDelay: '0.5s' }}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-black flex items-center gap-2 text-white">
        <Zap className="w-4 h-4 text-primary" /> New Goal
      </h3>
      <div className="w-8 h-8 rounded-full border-white/5 flex items-center justify-center opacity-40">
        <LayoutDashboard className="w-3.5 h-3.5" />
      </div>
    </div>

    <form onSubmit={handleCreateTask} className="space-y-8 text-left">
      <div className="space-y-3">
        <label className="label-mini">Commitment Description</label>
        <input
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., SHIP MVP PROTOCOL"
          className="input-field"
        />
      </div>

      <div className="space-y-3">
        <label className="label-mini">Execution Deadline</label>
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
        <label className="label-mini">Commitment Stake (USDC)</label>
        <div className="relative">
          <input
            type="number"
            required
            step="0.01"
            min="0"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="e.g., 10.00"
            className="input-field"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!isConnected || isTxPending || isConfirming}
          className="w-full btn-primary py-3 text-sm"
        >
          <span>{isConfirming ? 'Finalizing...' : 'Lock Commitment'}</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </form>
  </div>
)
