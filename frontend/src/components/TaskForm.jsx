import { Zap, LayoutDashboard, ArrowRight } from 'lucide-react'

export const TaskForm = ({ description, setDescription, deadline, setDeadline, handleCreateTask, isConnected, isTxPending, isConfirming }) => (
  <div className="glass-card p-10 bg-indigo-600/[0.03] border-indigo-500/20 animate-in" style={{ animationDelay: '0.5s' }}>
    <div className="flex items-center justify-between mb-10">
      <h3 className="text-2xl font-black flex items-center gap-3 font-heading text-white text-left">
        <Zap className="text-indigo-500 fill-indigo-500/20" /> New Goal
      </h3>
      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
        <LayoutDashboard className="w-4 h-4 text-gray-500" />
      </div>
    </div>

    <form onSubmit={handleCreateTask} className="space-y-8 text-left">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Commitment Description</label>
        <input
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., SHIP MVP PROTOCOL"
          className="w-full h-16 bg-black/40 border border-white/10 rounded-2xl px-6 text-white font-bold placeholder:text-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
        />
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Execution Deadline</label>
        <input
          type="datetime-local"
          required
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full h-16 bg-black/40 border border-white/10 rounded-2xl px-6 text-white font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all [color-scheme:dark]"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={!isConnected || isTxPending || isConfirming}
          className="w-full h-20 btn-primary text-white font-black rounded-[24px] text-lg flex items-center justify-center gap-3 group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{isConfirming ? 'Finalizing...' : 'Initiate Commitment'}</span>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
        </button>
      </div>
    </form>
  </div>
)
