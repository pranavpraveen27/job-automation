import { useState } from 'react';

function JobForm({ onJobAdded }) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!url.trim()) {
      setStatus('Please enter a job URL.');
      return;
    }

    setLoading(true);
    setStatus('Submitting application...');

    try {
      const response = await fetch('http://localhost:5000/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error || 'Failed to submit job.');
      } else {
        setStatus('Job submitted. Automation started.');
        setUrl('');
        onJobAdded();
      }
    } catch (error) {
      setStatus('Unable to reach backend. Is it running?');
      console.error('JobForm error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">New Job Application</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="job-url" className="block text-sm font-medium text-gray-700 mb-2">Job application URL</label>
          <input
            id="job-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/apply"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
      {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
    </section>
  );
}

export default JobForm;
