import { motion } from 'framer-motion';

function DashboardCard({ title, value, description, accent }) {
  return (
    <motion.section
      whileHover={{ y: -4 }}
      className={`rounded-3xl border border-slate-800/70 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20 ${accent}`}
    >
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">{title}</p>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </motion.section>
  );
}

export default DashboardCard;
