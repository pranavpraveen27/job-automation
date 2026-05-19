import { motion } from 'framer-motion';
import { Sparkles, UserCircle } from 'lucide-react';

function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between rounded-3xl border border-slate-800/70 bg-slate-950/90 px-6 py-4 shadow-2xl shadow-slate-950/20 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-sky-500 text-white shadow-lg shadow-indigo-500/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">AI Recruit</p>
          <h1 className="text-xl font-semibold text-white">Autonomous Job Agent</h1>
        </div>
      </div>

      <button className="inline-flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-700 hover:text-white">
        <UserCircle className="h-4 w-4" />
        Profile
      </button>
    </motion.header>
  );
}

export default Navbar;
