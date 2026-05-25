import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import DashboardCard from './components/DashboardCard.jsx';
import UploadBox from './components/UploadBox.jsx';
import JobCard from './components/JobCard.jsx';
import CoverLetterPanel from './components/CoverLetterPanel.jsx';
import GapAnalysisPanel from './components/GapAnalysisPanel.jsx';
import KanbanBoard from './components/KanbanBoard.jsx';
import ResumeAnalyzer from './pages/ResumeAnalyzer.jsx';
import JobSearch from './pages/JobSearch.jsx';
import Settings from './pages/Settings.jsx';
import Profile from './pages/Profile.jsx';
import {
  autoApplyToJob,
  createApplication,
  createJob,
  generateCoverLetter,
  getApplications,
  getJobs,
  updateApplication,
} from './services/api.js';

const emptyApplicationBoard = {
  wishlist: [],
  applied: [],
  interviewing: [],
  offer: [],
};

function normalizeJob(job) {
  return {
    ...job,
    id: job._id,
    match: job.aiAnalysis?.matchScore ?? 0,
    skills: job.skills || job.technologies || [],
  };
}

function normalizeApplication(application) {
  const job = application.jobId && typeof application.jobId === 'object' ? application.jobId : {};

  return {
    ...application,
    id: application._id,
    _applicationId: application._id,
    title: application.jobTitle || job.title || 'Saved application',
    company: application.company || job.company || 'Company not specified',
    location: job.location || '',
    match: application.matchScore ?? job.aiAnalysis?.matchScore ?? 0,
    status: application.status,
    skills: job.skills || [],
  };
}

function getApplicationColumn(status) {
  if (status === 'offer' || status === 'accepted') return 'offer';
  if (status === 'interview' || status === 'screening') return 'interviewing';
  return 'applied';
}

function App() {
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [resumeData, setResumeData] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [coverLoading, setCoverLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeView, setActiveView] = useState('recommendations');
  const [selectedJob, setSelectedJob] = useState(null);
  const [autoApplyingJobId, setAutoApplyingJobId] = useState(null);
  const [jobForm, setJobForm] = useState({
    jobPortal: 'custom',
    title: '',
    company: '',
    location: '',
    jobUrl: '',
    description: '',
    skills: '',
  });

  const loadDashboardData = async () => {
    if (!token) return;

    setLoadingData(true);
    setStatusMessage('');
    try {
      const [jobResponse, applicationResponse] = await Promise.all([
        getJobs(token),
        getApplications(token),
      ]);

      const normalizedJobs = jobResponse.jobs.map(normalizeJob);
      const normalizedApplications = applicationResponse.applications.map(normalizeApplication);

      setJobs(normalizedJobs);
      setApplications(normalizedApplications);
      setSelectedJob((current) => current || normalizedJobs[0] || null);
    } catch (error) {
      setStatusMessage(error.message || 'Unable to load dashboard data.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const extractedSkills = useMemo(() => resumeData?.skills || [], [resumeData]);

  const trackedApplications = useMemo(() => {
    const board = {
      ...emptyApplicationBoard,
      wishlist: jobs.filter((job) => job.applicationStatus === 'pending'),
    };

    applications.forEach((application) => {
      board[getApplicationColumn(application.status)].push(application);
    });

    return board;
  }, [applications, jobs]);

  const stats = useMemo(() => {
    const interviews = applications.filter((item) => ['screening', 'interview'].includes(item.status)).length;
    const pending = jobs.filter((job) => job.applicationStatus === 'pending').length;
    const scoredJobs = jobs.filter((job) => Number.isFinite(job.match));
    const averageMatch = scoredJobs.length
      ? Math.round(scoredJobs.reduce((total, job) => total + job.match, 0) / scoredJobs.length)
      : 0;

    return [
      { title: 'Jobs Saved', value: String(jobs.length), description: 'Jobs stored in your backend', accent: 'bg-slate-950/90' },
      { title: 'Applications', value: String(applications.length), description: 'Applications tracked from MongoDB', accent: 'bg-slate-950/90' },
      { title: 'Resume Match', value: `${averageMatch}%`, description: 'Average backend match score', accent: 'bg-slate-950/90' },
      { title: 'Pending', value: String(pending + interviews), description: 'Jobs and interviews needing action', accent: 'bg-slate-950/90' },
    ];
  }, [applications, jobs]);

  const handleUploadComplete = (result) => {
    setResumeData(result);
    setCoverLetter('');
  };

  const handleSaveJob = async (event) => {
    event.preventDefault();
    setStatusMessage('');

    try {
      const response = await createJob({
        jobPortal: jobForm.jobPortal,
        title: jobForm.title,
        company: jobForm.company,
        location: jobForm.location,
        description: jobForm.description,
        jobUrl: jobForm.jobUrl,
        skills: jobForm.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      }, token);

      const savedJob = normalizeJob(response.job);
      setJobs((current) => [savedJob, ...current]);
      setSelectedJob(savedJob);
      setJobForm({ jobPortal: 'custom', title: '', company: '', location: '', jobUrl: '', description: '', skills: '' });
      setStatusMessage('Job saved to backend.');
    } catch (error) {
      setStatusMessage(error.message || 'Unable to save job.');
    }
  };

  const handleApplyToJob = async (job) => {
    setStatusMessage('');
    try {
      const response = await createApplication({
        jobId: job._id || job.id,
        resumeId: resumeData?._id,
        coverLetter,
        autoApplied: false,
      }, token);

      const application = normalizeApplication(response.application);
      setApplications((current) => [application, ...current]);
      setJobs((current) => current.map((item) => (
        item.id === job.id ? { ...item, applicationStatus: 'applied' } : item
      )));
      setSelectedJob(job);
      setActiveView('applications');
      setStatusMessage('Application created in backend.');
    } catch (error) {
      setStatusMessage(error.message || 'Unable to create application.');
    }
  };

  const handleAutoApplyToJob = async (job) => {
    setStatusMessage('');
    setAutoApplyingJobId(job.id);
    try {
      const response = await autoApplyToJob(job._id || job.id, {
        resumeId: resumeData?._id,
        coverLetter,
      }, token);

      const application = normalizeApplication(response.application);
      setApplications((current) => [application, ...current]);
      setJobs((current) => current.map((item) => (
        item.id === job.id ? { ...item, applicationStatus: 'applied', autoApplied: true } : item
      )));
      setSelectedJob(job);
      setActiveView('applications');
      setStatusMessage('Playwright auto-apply completed and saved the application.');
    } catch (error) {
      setStatusMessage(error.message || 'Unable to auto-apply with Playwright.');
    } finally {
      setAutoApplyingJobId(null);
    }
  };

  const handleTrackApplication = async (job, column) => {
    setSelectedJob(job);
    if (column === 'applied') {
      await handleApplyToJob(job);
    } else {
      setActiveView('applications');
    }
  };

  const handleMoveCard = async (fromColumn, toColumn, item) => {
    const statusByColumn = {
      applied: 'submitted',
      interviewing: 'interview',
      offer: 'offer',
    };

    if (!item._applicationId || !statusByColumn[toColumn]) return;

    try {
      const response = await updateApplication(item._applicationId, {
        status: statusByColumn[toColumn],
      }, token);
      const updated = normalizeApplication(response.application);
      setApplications((current) => current.map((application) => (
        application.id === updated.id ? updated : application
      )));
    } catch (error) {
      setStatusMessage(error.message || 'Unable to update application status.');
    }
  };

  const handleRemoveCard = (column, itemId) => {
    if (column === 'wishlist') return;
    setApplications((current) => current.filter((application) => application.id !== itemId));
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedJob) {
      setCoverLetter('Save or select a job before generating a cover letter.');
      return;
    }

    setCoverLoading(true);
    try {
      const payload = {
        candidate_name: storedUser.fullName || 'Candidate',
        candidate_summary: resumeData?.summary || 'Candidate profile from uploaded resume.',
        skills: extractedSkills,
        job_title: selectedJob.title,
        company_name: selectedJob.company,
        company_description: selectedJob.description,
        resume_id: resumeData?._id,
        job_id: selectedJob._id || selectedJob.id,
      };
      const response = await generateCoverLetter(payload, token);
      setCoverLetter(response.cover_letter);
    } catch (error) {
      setCoverLetter(error.message || 'Unable to generate cover letter right now.');
    } finally {
      setCoverLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-[1700px] gap-8 px-5 py-8 lg:grid-cols-[280px_minmax(0,_1fr)] lg:px-10">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />

        <div className="space-y-8">
          <Navbar onProfileClick={() => setActiveView('profile')} />

          {/* Dashboard View */}
          {activeView === 'recommendations' && (
            <>
              <section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,_1fr)_420px]">
                  <div className="space-y-6">
                    <p className="text-sm uppercase tracking-[0.34em] text-sky-400/80">Backend connected</p>
                    <h2 className="text-4xl font-semibold text-white sm:text-5xl">Your live job application workspace.</h2>
                    <p className="max-w-2xl text-slate-400">Jobs, applications, resumes, and cover letters now come from your Express API and MongoDB data.</p>
                    {statusMessage && <p className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">{statusMessage}</p>}
                  </div>

              <form onSubmit={handleSaveJob} className="rounded-[1.5rem] border border-slate-800/80 bg-slate-900/70 p-5">
                <h3 className="text-lg font-semibold text-white">Save job</h3>
                <div className="mt-4 grid gap-3">
                  <select value={jobForm.jobPortal} onChange={(event) => setJobForm({ ...jobForm, jobPortal: event.target.value })} className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500">
                    <option value="custom">Custom</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="indeed">Indeed</option>
                    <option value="glassdoor">Glassdoor</option>
                    <option value="wellfound">Wellfound</option>
                  </select>
                  <input required value={jobForm.title} onChange={(event) => setJobForm({ ...jobForm, title: event.target.value })} placeholder="Job title" className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500" />
                  <input required value={jobForm.company} onChange={(event) => setJobForm({ ...jobForm, company: event.target.value })} placeholder="Company" className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500" />
                  <input value={jobForm.location} onChange={(event) => setJobForm({ ...jobForm, location: event.target.value })} placeholder="Location" className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500" />
                  <input value={jobForm.jobUrl} onChange={(event) => setJobForm({ ...jobForm, jobUrl: event.target.value })} placeholder="Job URL" className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500" />
                  <textarea value={jobForm.description} onChange={(event) => setJobForm({ ...jobForm, description: event.target.value })} placeholder="Job description" rows={3} className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500" />
                  <input value={jobForm.skills} onChange={(event) => setJobForm({ ...jobForm, skills: event.target.value })} placeholder="Skills, comma separated" className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500" />
                </div>
                <button type="submit" className="mt-4 w-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white">Save to backend</button>
              </form>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <DashboardCard key={stat.title} {...stat} />
                ))}
              </div>

              <UploadBox onUploadComplete={handleUploadComplete} />

              <section className="rounded-[2rem] border border-slate-800/70 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">Skill summary</p>
                    <h2 className="text-2xl font-semibold text-white">Extracted skills</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateCoverLetter}
                    disabled={coverLoading || !selectedJob}
                    className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
                  >
                    {coverLoading ? 'Generating...' : 'Generate cover letter'}
                  </button>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {extractedSkills.length > 0 ? extractedSkills.map((skill) => (
                    <span key={skill} className="rounded-full border border-slate-800/70 bg-slate-900/90 px-4 py-2 text-sm text-slate-200">
                      {skill}
                    </span>
                  )) : <p className="text-sm text-slate-500">Upload a resume to extract skills.</p>}
                </div>
              </section>

              <GapAnalysisPanel extractedSkills={extractedSkills} selectedJob={selectedJob} />
            </div>

            <CoverLetterPanel coverLetter={coverLetter} onRegenerate={handleGenerateCoverLetter} isLoading={coverLoading} />
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">
                  {activeView === 'recommendations' ? 'Saved jobs' : 'Application tracking'}
                </p>
                <h2 className="text-3xl font-semibold text-white">
                  {activeView === 'recommendations' ? 'Backend job records' : 'Kanban board'}
                </h2>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setActiveView('recommendations')} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeView === 'recommendations' ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white' : 'border border-slate-800/70 bg-slate-900/90 text-slate-200 hover:border-slate-700'}`}>Jobs</button>
                <button onClick={() => setActiveView('applications')} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeView === 'applications' ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white' : 'border border-slate-800/70 bg-slate-900/90 text-slate-200 hover:border-slate-700'}`}>Applications ({applications.length})</button>
              </div>
            </div>

            {loadingData ? (
              <p className="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6 text-slate-400">Loading backend jobs...</p>
            ) : jobs.length > 0 ? (
              <div className="grid gap-5 xl:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onTrackApplication={handleTrackApplication}
                    onApply={handleApplyToJob}
                    onAutoApply={handleAutoApplyToJob}
                    isAutoApplying={autoApplyingJobId === job.id}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6 text-slate-400">No backend jobs yet. Save your first job above.</p>
            )}
          </section>
          </>
          )}

          {/* Resume Analyzer View */}
          {activeView === 'resume-analyzer' && <ResumeAnalyzer />}

          {/* Job Search View */}
          {activeView === 'job-search' && <JobSearch />}

          {/* Applications View - Standalone */}
          {activeView === 'applications' && (
            <>
              <section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
                <div>
                  <p className="text-sm uppercase tracking-[0.34em] text-sky-400/80">Application Tracking</p>
                  <h2 className="text-3xl font-semibold text-white mt-2">Your Applications</h2>
                </div>
              </section>
              <KanbanBoard
                applications={trackedApplications}
                onMoveCard={handleMoveCard}
                onRemoveCard={handleRemoveCard}
              />
            </>
          )}

          {/* Settings View */}
          {activeView === 'settings' && <Settings />}

          {/* Profile View */}
          {activeView === 'profile' && <Profile />}
        </div>
      </div>
    </div>
  );
}

export default App;
