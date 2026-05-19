import { useMemo, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import DashboardCard from './components/DashboardCard.jsx';
import UploadBox from './components/UploadBox.jsx';
import JobCard from './components/JobCard.jsx';
import CoverLetterPanel from './components/CoverLetterPanel.jsx';
import GapAnalysisPanel from './components/GapAnalysisPanel.jsx';
import KanbanBoard from './components/KanbanBoard.jsx';
import { generateCoverLetter } from './services/api.js';

const jobs = [
  {
    id: '1',
    title: 'AI Product Manager',
    company: 'Nimbus Labs',
    location: 'Remote',
    salary: '$140k - $160k',
    match: 92,
    description: 'Lead AI product strategy and improve candidate experience with intelligent automation.',
    skills: ['AI', 'Product', 'Data', 'UX'],
  },
  {
    id: '2',
    title: 'Resume Intelligence Engineer',
    company: 'VectorFlow',
    location: 'San Francisco, CA',
    salary: '$130k - $150k',
    match: 87,
    description: 'Build resume extraction pipelines and deliver smart recruiter insights.',
    skills: ['Python', 'NLP', 'Resume Parsing', 'AWS'],
  },
  {
    id: '3',
    title: 'Talent Ops Specialist',
    company: 'Aurora AI',
    location: 'New York, NY',
    salary: '$120k - $135k',
    match: 81,
    description: 'Optimize hiring workflows using AI match scores and automation dashboards.',
    skills: ['Automation', 'Recruiting', 'Analytics'],
  },
];

const stats = [
  { title: 'Jobs Applied', value: '48', description: 'Successful submissions processed', accent: 'bg-slate-950/90' },
  { title: 'Resume Match', value: '89%', description: 'Average AI match score', accent: 'bg-slate-950/90' },
  { title: 'Interviews', value: '12', description: 'Active interviews in pipeline', accent: 'bg-slate-950/90' },
  { title: 'Pending', value: '7', description: 'Applications awaiting follow-up', accent: 'bg-slate-950/90' },
];

function App() {
  const [resumeData, setResumeData] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [coverLoading, setCoverLoading] = useState(false);
  const [letterTone, setLetterTone] = useState('Professional');
  const [activeView, setActiveView] = useState('recommendations'); // 'recommendations' or 'applications'
  const [selectedJob, setSelectedJob] = useState(null);
  const [trackedApplications, setTrackedApplications] = useState({
    wishlist: [],
    applied: [],
    interviewing: [],
    offer: [],
  });

  const extractedSkills = useMemo(
    () => resumeData?.skills ?? ['AI', 'Resume Parsing', 'Automation', 'Matching'],
    [resumeData]
  );

  const handleUploadComplete = (result) => {
    setResumeData(result);
    setCoverLetter('');
  };

  const handleGenerateCoverLetter = async () => {
    setCoverLoading(true);
    try {
      const payload = {
        candidate_name: 'Alex Reed',
        candidate_summary: 'Experienced AI developer with a strong track record building recruiter-facing automation tools.',
        skills: extractedSkills,
        job_title: 'AI Product Manager',
        company_name: 'Nimbus Labs',
        company_description: 'A startup that democratizes intelligent recruiting for high-growth teams.',
        tone: letterTone,
      };
      const response = await generateCoverLetter(payload);
      setCoverLetter(response.cover_letter);
    } catch (error) {
      setCoverLetter('Unable to generate cover letter right now.');
      console.error(error);
    } finally {
      setCoverLoading(false);
    }
  };

  // Kanban board handlers
  const handleTrackApplication = (job, column) => {
    setTrackedApplications(prev => ({
      ...prev,
      [column]: [...prev[column], job]
    }));
    setSelectedJob(job);
  };

  const handleMoveCard = (fromColumn, toColumn, job) => {
    setTrackedApplications(prev => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter(j => j.id !== job.id),
      [toColumn]: [...prev[toColumn], job]
    }));
  };

  const handleRemoveCard = (column, jobId) => {
    setTrackedApplications(prev => ({
      ...prev,
      [column]: prev[column].filter(j => j.id !== jobId)
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-[1700px] gap-8 px-5 py-8 lg:grid-cols-[280px_minmax(0,_1fr)] lg:px-10">
        <Sidebar />

        <div className="space-y-8">
          <Navbar />

          <section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/20">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,_1.15fr)_minmax(0,_0.85fr)] lg:items-center">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.34em] text-sky-400/80">AI Job Agent</p>
                <h2 className="text-4xl font-semibold text-white sm:text-5xl">Apply to jobs faster with smart AI workflows.</h2>
                <p className="max-w-2xl text-slate-400">Upload your resume, analyze your skills, and match to the best opportunities with a modern dashboard built for recruiters and ambitious talent.</p>
                <div className="flex flex-wrap items-center gap-4">
                  <button className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:scale-[1.01]">
                    Get started
                  </button>
                  <button className="rounded-full border border-slate-700/70 bg-slate-900/90 px-6 py-3 text-sm text-slate-200 transition hover:border-slate-600">
                    View demo
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-800/70 bg-slate-900/80 p-6 shadow-inner shadow-slate-950/10">
                <div className="grid gap-4 rounded-[1.75rem] bg-gradient-to-br from-slate-950 to-slate-900 p-6 shadow-2xl shadow-slate-950/30">
                  <div className="rounded-3xl border border-slate-800/90 bg-slate-950/90 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Live analytics</p>
                    <h3 className="mt-4 text-3xl font-semibold text-white">AI match score</h3>
                    <p className="mt-3 text-slate-400">Watch your applications improve with real-time resume feedback, matching, and AI writing tools.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.75rem] bg-slate-900/90 p-4 text-center">
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Current score</p>
                      <p className="mt-4 text-4xl font-semibold text-white">89%</p>
                      <p className="mt-2 text-sm text-slate-500">Resume-to-job match</p>
                    </div>
                    <div className="rounded-[1.75rem] bg-slate-900/90 p-4 text-center">
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Predicted interviews</p>
                      <p className="mt-4 text-4xl font-semibold text-white">12</p>
                      <p className="mt-2 text-sm text-slate-500">Quality opportunities ahead</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
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
                    disabled={coverLoading}
                    className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
                  >
                    {coverLoading ? 'Generating...' : 'Generate cover letter'}
                  </button>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {extractedSkills.map((skill) => (
                    <span key={skill} className="rounded-full border border-slate-800/70 bg-slate-900/90 px-4 py-2 text-sm text-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {/* Task 3: Tone Selector */}
              <section className="rounded-[2rem] border border-slate-800/70 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
                <div className="mb-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">Cover Letter Style</p>
                  <h3 className="text-2xl font-semibold text-white mt-2">Select tone</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'professional', label: '👔 Professional', value: 'Professional' },
                    { id: 'confident', label: '⚡ Confident', value: 'Confident' },
                    { id: 'startup', label: '🚀 Startup-Vibe', value: 'Startup-Vibe' },
                    { id: 'concise', label: '📝 Concise', value: 'Concise' },
                  ].map(tone => (
                    <button
                      key={tone.id}
                      onClick={() => setLetterTone(tone.value)}
                      className={`px-5 py-3 rounded-full font-semibold text-sm transition ${
                        letterTone === tone.value
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30'
                          : 'border border-slate-800/70 bg-slate-900/90 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {tone.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Task 1: Gap Analysis Panel */}
              <GapAnalysisPanel extractedSkills={extractedSkills} selectedJob={selectedJob || jobs[0]} />
            </div>

            <CoverLetterPanel coverLetter={coverLetter} onRegenerate={handleGenerateCoverLetter} />
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">
                  {activeView === 'recommendations' ? 'Job recommendations' : 'Application tracking'}
                </p>
                <h2 className="text-3xl font-semibold text-white">
                  {activeView === 'recommendations' ? 'Smart matches for your profile' : 'Kanban board'}
                </h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveView('recommendations')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    activeView === 'recommendations'
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                      : 'border border-slate-800/70 bg-slate-900/90 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  Jobs
                </button>
                <button
                  onClick={() => setActiveView('applications')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    activeView === 'applications'
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                      : 'border border-slate-800/70 bg-slate-900/90 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  Applications ({Object.values(trackedApplications).flat().length})
                </button>
              </div>
            </div>

            {activeView === 'recommendations' ? (
              <div className="grid gap-5 xl:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onTrackApplication={handleTrackApplication}
                  />
                ))}
              </div>
            ) : (
              <KanbanBoard
                applications={trackedApplications}
                onMoveCard={handleMoveCard}
                onRemoveCard={handleRemoveCard}
              />
            )}
          </section>

          <footer className="rounded-[2rem] border border-slate-800/70 bg-slate-950/90 p-6 text-sm text-slate-500 shadow-2xl shadow-slate-950/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 AI Recruit. Built for recruiters, talent teams, and modern job seekers.</p>
              <div className="flex flex-wrap gap-4 text-slate-400">
                <a href="#" className="transition hover:text-white">GitHub</a>
                <a href="#" className="transition hover:text-white">Contact</a>
                <a href="#" className="transition hover:text-white">Tech Stack</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
