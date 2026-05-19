import { useState } from 'react';
import { createJob } from './services/api.js';

function JobForm({ onJobAdded }) {
  const [form, setForm] = useState({
    title: '',
    company: '',
    jobUrl: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      await createJob({
        jobPortal: 'custom',
        title: form.title,
        company: form.company,
        jobUrl: form.jobUrl,
      }, localStorage.getItem('token'));
      setStatus('Job saved.');
      setForm({ title: '', company: '', jobUrl: '' });
      onJobAdded?.();
    } catch (error) {
      setStatus(error.message || 'Failed to save job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
      <h2 className="text-xl font-semibold text-white">Save Job</h2>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
        <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Job title" className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white" />
        <input required value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} placeholder="Company" className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white" />
        <input value={form.jobUrl} onChange={(event) => setForm({ ...form, jobUrl: event.target.value })} placeholder="Job URL" className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white" />
        <button type="submit" disabled={loading} className="rounded-full bg-sky-500 px-4 py-2 font-semibold text-white disabled:opacity-60">
          {loading ? 'Saving...' : 'Save Job'}
        </button>
      </form>
      {status && <p className="mt-3 text-sm text-slate-400">{status}</p>}
    </section>
  );
}

export default JobForm;
