import { motion } from 'framer-motion';
import { GripVertical, X, ChevronRight } from 'lucide-react';

function KanbanBoard({ applications, onMoveCard, onRemoveCard }) {
  const columns = [
    { id: 'wishlist', title: 'Wishlist', icon: '🌟', color: 'from-slate-700 to-slate-600' },
    { id: 'applied', title: 'Applied', icon: '📤', color: 'from-sky-700 to-sky-600' },
    { id: 'interviewing', title: 'Interviewing', icon: '💬', color: 'from-purple-700 to-purple-600' },
    { id: 'offer', title: 'Offer Received', icon: '🎉', color: 'from-emerald-700 to-emerald-600' },
  ];

  const KanbanCard = ({ job, columnId, onMove, onRemove }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group rounded-[1.25rem] border border-slate-700/60 bg-slate-900/80 p-4 shadow-lg hover:shadow-xl hover:border-slate-600/80 transition"
    >
      <div className="flex items-start gap-3">
        <GripVertical className="h-4 w-4 text-slate-600 mt-1 group-hover:text-slate-400 transition" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm truncate">{job.title}</h4>
          <p className="text-xs text-slate-400 truncate">{job.company}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/60 px-2 py-1 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-sky-400"></span>
              {job.match}% match
            </span>
          </div>
        </div>
        <button
          onClick={() => onRemove(columnId, job.id)}
          className="opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-red-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Move buttons */}
      {columnId !== 'offer' && (
        <div className="mt-3 flex gap-2 text-xs">
          {columns
            .filter(col => columns.indexOf(col) > columns.indexOf(columns.find(c => c.id === columnId)))
            .map((nextCol) => (
              <motion.button
                key={nextCol.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => onMove(columnId, nextCol.id, job)}
                className="flex items-center gap-1 rounded-full bg-slate-800/40 hover:bg-slate-700/60 px-2 py-1 text-slate-400 hover:text-slate-200 transition"
              >
                <ChevronRight className="h-3 w-3" />
                {nextCol.title.split(' ')[0]}
              </motion.button>
            ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] border border-slate-800/70 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20"
    >
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">Application Tracking</p>
        <h2 className="text-2xl font-semibold text-white mt-2">Kanban board</h2>
        <p className="text-sm text-slate-400 mt-1">Track your applications through each stage of the hiring process</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4 overflow-x-auto">
        {columns.map((column) => {
          const columnJobs = applications[column.id] || [];
          return (
            <motion.div
              key={column.id}
              className="flex flex-col rounded-[1.5rem] border border-slate-800/50 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-4"
            >
              {/* Column Header */}
              <div className="mb-4 pb-3 border-b border-slate-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{column.icon}</span>
                  <h3 className="font-semibold text-white text-sm">{column.title}</h3>
                </div>
                <p className="text-xs text-slate-500">{columnJobs.length} items</p>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-3 min-h-[300px]">
                {columnJobs.length > 0 ? (
                  columnJobs.map((job) => (
                    <KanbanCard
                      key={`${column.id}-${job.id}`}
                      job={job}
                      columnId={column.id}
                      onMove={onMoveCard}
                      onRemove={onRemoveCard}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                    <p className="text-center">Drop jobs here</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

export default KanbanBoard;
