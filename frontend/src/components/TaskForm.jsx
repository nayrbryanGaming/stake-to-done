import { Zap, ArrowRight } from 'lucide-react'
import { motion as Motion } from 'framer-motion'

export const TaskForm = ({ description, setDescription, deadline, setDeadline, stakeAmount, setStakeAmount, handleCreateTask, isConnected, isTxPending, isConfirming }) => (
  <Motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: 0.4 }}
    className="glass-card flex flex-col p-6 sm:p-8 border-primary/20"
  >
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-xl font-black flex items-center gap-4 text-white font-outfit">
        <Motion.div 
          whileHover={{ rotate: 180 }}
          className="icon-widget h-12 w-12 bg-primary/10"
        >
          <Zap className="text-primary" />
        </Motion.div>
        Create Task
      </h3>
    </div>

    <form onSubmit={handleCreateTask} className="space-y-8 text-left">
      <div className="space-y-3">
        <label className="label-mini">Task Description</label>
        <input
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Example: Finish report draft"
          className="input-field border-primary-dim"
        />
      </div>

      <div className="space-y-3">
        <label className="label-mini">Deadline</label>
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
        <label className="label-mini">Stake (USDC)</label>
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
        <Motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!isConnected || isTxPending || isConfirming}
          className="w-full btn-primary py-4 text-base shadow-premium"
        >
          <span>{isConfirming ? 'PROCESSING...' : 'CREATE AND STAKE'}</span>
          <ArrowRight className="w-5 h-5 ml-3" />
        </Motion.button>
      </div>
    </form>
  </Motion.div>
)
