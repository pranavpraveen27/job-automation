import { useEffect, useState } from 'react';
import { getJobs } from './services/api.js';

function JobList({ refreshSignal }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getJobs(localStorage.getItem('token'));
      setJobs(response.jobs);
    } catch (err) {
      setError(err.message || 'Unable to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (refreshSignal > 0) loadJobs();
  }, [refreshSignal]);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Saved Jobs</h2>
        <button type="button" onClick={loadJobs} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
          Refresh
        </button>
      </div>

      {loading && <p className="mt-4 text-slate-400">Loading jobs...</p>}
      {error && <p className="mt-4 text-red-300">{error}</p>}
      {!loading && jobs.length === 0 && <p className="mt-4 text-slate-400">No jobs saved yet.</p>}

      <div className="mt-4 grid gap-3">
        {jobs.map((job) => (
          <article key={job._id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="font-semibold text-white">{job.title}</h3>
            <p className="text-sm text-slate-400">{job.company}</p>
            {job.jobUrl && <a href={job.jobUrl} target="_blank" rel="noreferrer" className="text-sm text-sky-300">Open posting</a>}
          </article>
        ))}
      </div>
    </section>
  );
}

export default JobList;
