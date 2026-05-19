import { useMemo, useState, useEffect } from 'react';
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import DashboardCard from "../components/DashboardCard.jsx";
import UploadBox from "../components/UploadBox.jsx";
import JobCard from "../components/JobCard.jsx";
import CoverLetterPanel from "../components/CoverLetterPanel.jsx";
import AIInsightsPanel from "../components/AIInsightsPanel.jsx";
import { generateCoverLetter, getApplications } from "../services/api.js";

function Dashboard() {
  const [resumeData, setResumeData] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [coverLoading, setCoverLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    applied: 0,
    match: 0,
    interviews: 0,
    pending: 0,
  });
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');

  // Default jobs if none from backend
  const defaultJobs = [
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

  useEffect(() => {
    loadApplicationsData();
  }, [token]);

  const loadApplicationsData = async () => {
    if (!token) return;
    
    try {
      const response = await getApplications(token);
      if (response.success && response.applications) {
        setApplications(response.applications);
        
        // Calculate stats from applications
        const total = response.applications.length;
        const interviews = response.applications.filter(a => a.status === 'interview').length;
        const pending = response.applications.filter(a => a.status === 'submitted').length;
        
        setStats({
          applied: total,
          match: total > 0 ? Math.round((total / (total + 5)) * 100) : 89,
          interviews: interviews,
          pending: pending,
        });
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      // Use default stats if error
    }

    // Use default jobs if none provided
    setJobs(defaultJobs);
  };

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
      };
      const response = await generateCoverLetter(payload, token);
      setCoverLetter(response.cover_letter || response.message || 'Cover letter generated');
    } catch (error) {
      setCoverLetter('Unable to generate cover letter right now.');
      console.error(error);
    } finally {
      setCoverLoading(false);
    }
  };

  const dashboardStats = [
    { 
      title: 'Jobs Applied', 
      value: stats.applied.toString(), 
      description: 'Successful submissions processed', 
      accent: 'bg-slate-950/90' 
    },
    { 
      title: 'Resume Match', 
      value: stats.match + '%', 
      description: 'Average AI match score', 
      accent: 'bg-slate-950/90' 
    },
    { 
      title: 'Interviews', 
      value: stats.interviews.toString(), 
      description: 'Active interviews in pipeline', 
      accent: 'bg-slate-950/90' 
    },
    { 
      title: 'Pending', 
      value: stats.pending.toString(), 
      description: 'Applications awaiting follow-up', 
      accent: 'bg-slate-950/90' 
    },
  ];

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
                <div className="flex flex-wrap items-center gap-4"></div>
              </div>

              <UploadBox onUploadComplete={handleUploadComplete} />
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Recommended Opportunities</h3>
                <p className="text-sm text-slate-400">Based on your resume and preferences</p>
              </div>

              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </section>

            <div className="space-y-6">
              <CoverLetterPanel
                coverLetter={coverLetter}
                onRegenerate={handleGenerateCoverLetter}
                isLoading={coverLoading}
                applicationId={applications[0]?._id}
                token={token}
              />

              <AIInsightsPanel 
                resumeId={resumeData?._id}
                token={token}
              />

              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Your Statistics</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dashboardStats.map((stat, index) => (
                    <DashboardCard key={index} {...stat} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
