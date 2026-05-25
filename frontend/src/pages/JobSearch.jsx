import { motion } from 'framer-motion';
import { Search, MapPin, DollarSign, Briefcase } from 'lucide-react';
import { useState } from 'react';

function JobSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    salaryMin: '',
    salaryMax: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    // Integration with job search API can be added here
    console.log('Searching for:', searchQuery, filters);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.34em] text-sky-400/80">Explore Opportunities</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Job Search</h2>
            <p className="mt-2 max-w-2xl text-slate-400">Search and discover job opportunities that match your skills and preferences.</p>
          </div>
          <Search className="h-12 w-12 text-sky-400/40" />
        </div>
      </section>

      {/* Search Bar */}
      <motion.form
        onSubmit={handleSearch}
        className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl"
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Job title, company, or keywords..."
              className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-sky-500/30"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-6 py-3 text-white transition hover:border-slate-700"
            >
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 lg:grid-cols-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="City or Remote"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Job Type</label>
                <select
                  value={filters.jobType}
                  onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Min Salary</label>
                <input
                  type="number"
                  value={filters.salaryMin}
                  onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                  placeholder="40000"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Max Salary</label>
                <input
                  type="number"
                  value={filters.salaryMax}
                  onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })}
                  placeholder="120000"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>
            </motion.div>
          )}
        </div>
      </motion.form>

      {/* Empty State */}
      <motion.section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-12 text-center shadow-2xl">
        <Search className="mx-auto h-16 w-16 text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Start Your Job Search</h3>
        <p className="text-slate-400 max-w-md mx-auto">
          Search for jobs using keywords, location, company name, or job title. Use filters to narrow down your perfect match.
        </p>
        <p className="mt-4 text-sm text-slate-500">
          💡 Tip: Integration with job boards (LinkedIn, Indeed, Glassdoor) coming soon!
        </p>
      </motion.section>
    </motion.div>
  );
}

export default JobSearch;
