import { motion } from 'framer-motion';
import { Briefcase, ArrowRight, Plus } from 'lucide-react';
import { useState } from 'react';

function JobCard({ job, onTrackApplication, onApply }) {
  const [showMenu, setShowMenu] = useState(false);

  const skills = job.skills || [];
  const salary = typeof job.salary === 'string'
    ? job.salary
    : [job.salary?.min, job.salary?.max].filter(Boolean).join(' - ');
  const detailLine = [job.location, salary].filter(Boolean).join(' - ') || 'Details not specified';

  const handleTrack = (column) => {
    onTrackApplication?.(job, column);
    setShowMenu(false);
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20 transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">
            <Briefcase className="h-3.5 w-3.5" />
            {job.company}
          </span>
          <h3 className="mt-4 text-xl font-semibold text-white">{job.title}</h3>
          <p className="mt-2 text-sm text-slate-400">{detailLine}</p>
        </div>
        <div className="rounded-3xl bg-slate-900 px-4 py-3 text-right text-sm text-slate-300">
          <p className="font-semibold text-white">{job.match ?? 0}%</p>
          <p className="text-slate-500">Match</p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-400">{job.description || 'No job description saved yet.'}</p>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          {skills.map((skill) => (
            <span key={skill} className="rounded-full bg-slate-900/80 px-3 py-1">{skill}</span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800/80"
              title="Track this application"
            >
              <Plus className="h-4 w-4" />
            </button>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full z-50 mt-2 w-40 rounded-[1.25rem] border border-slate-700/80 bg-slate-900/95 shadow-lg"
              >
                {['wishlist', 'applied', 'interviewing', 'offer'].map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => handleTrack(stage)}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-200 transition first:rounded-t-[1rem] last:rounded-b-[1rem] hover:bg-slate-800/60"
                  >
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onApply?.(job)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition group-hover:scale-[1.02]"
          >
            Apply
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default JobCard;
