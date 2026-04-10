import { useEffect, useState } from 'react';

function JobList({ refreshSignal }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/jobs');
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to load jobs.');
      } else {
        setJobs(data);
      }
    } catch (err) {
      setError('Unable to reach backend.');
      console.error('JobList error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (refreshSignal > 0) loadJobs();
  }, [refreshSignal]);

  return (
    <section className="card">
      <div className="list-header">
        <h2>Job Status Dashboard</h2>
        <button type="button" onClick={loadJobs}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading jobs...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && jobs.length === 0 && <p>No jobs yet. Submit one above.</p>}

      {jobs.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id}>
                <td>
                  <a href={job.url} target="_blank" rel="noreferrer">
                    {job.url}
                  </a>
                </td>
                <td>
                  <div className={`status-badge status-${job.status}`}>
                    {job.status}
                  </div>
                  {job.error && <div className="job-error">Error: {job.error}</div>}
                </td>
                <td>{new Date(job.createdAt).toLocaleString()}</td>
                <td>{new Date(job.updatedAt).toLocaleString()}</td>
                <td>
                  {job.screenshotUrl ? (
                    <div className="screenshot-preview">
                      <a href={job.screenshotUrl} target="_blank" rel="noreferrer">
                        View screenshot
                      </a>
                      <img
                        src={job.screenshotUrl}
                        alt={`Screenshot for job ${job._id}`}
                      />
                    </div>
                  ) : (
                    <span>–</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default JobList;
