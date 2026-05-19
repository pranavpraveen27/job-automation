import { AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

function GapAnalysisPanel({ extractedSkills, selectedJob }) {
  // Define job tech stack requirements
  const jobRequirements = {
    '1': ['AI', 'Product', 'Data', 'UX', 'Python', 'JavaScript', 'React', 'SQL', 'Docker'],
    '2': ['Python', 'NLP', 'Resume Parsing', 'AWS', 'Machine Learning', 'FastAPI', 'PostgreSQL', 'Docker', 'GraphQL'],
    '3': ['Automation', 'Recruiting', 'Analytics', 'Excel', 'Salesforce', 'Zapier', 'JavaScript', 'TypeScript'],
  };

  const selectedJobId = selectedJob?.id || '1';
  const requiredSkills = jobRequirements[selectedJobId] || jobRequirements['1'];
  
  // Calculate matches
  const matchedSkills = extractedSkills.filter(skill =>
    requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
  );
  
  const missingSkills = requiredSkills.filter(req =>
    !extractedSkills.some(skill => skill.toLowerCase() === req.toLowerCase())
  );

  // Calculate metrics
  const keywordMatchPercent = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  const experienceLevelMatch = Math.min(100, Math.round((extractedSkills.length / 12) * 100)); // Assume 12 skills = 100%
  const techStackCoverage = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  // Metrics array
  const metrics = [
    { label: 'Keyword Match', value: keywordMatchPercent, color: 'bg-sky-500' },
    { label: 'Experience Level', value: experienceLevelMatch, color: 'bg-emerald-500' },
    { label: 'Tech Stack Coverage', value: techStackCoverage, color: 'bg-purple-500' },
  ];

  // Render progress bar
  const ProgressBar = ({ value, color }) => (
    <div className="h-2 w-full rounded-full bg-slate-800/60 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full ${color} rounded-full shadow-lg shadow-sky-500/30`}
      />
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] border border-slate-800/70 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20"
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">Resume Analysis</p>
          <h3 className="text-2xl font-semibold text-white mt-2">Tech Stack Gap Analysis</h3>
        </div>
        <TrendingUp className="h-5 w-5 text-sky-400" />
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[1.5rem] border border-slate-800/50 bg-slate-900/50 p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{metric.label}</p>
              <p className="text-lg font-semibold text-white">{metric.value}%</p>
            </div>
            <ProgressBar value={metric.value} color={metric.color} />
          </div>
        ))}
      </div>

      {/* Matched Skills */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-[0.24em] mb-3">
          Matched Skills ({matchedSkills.length}/{requiredSkills.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.length > 0 ? (
            matchedSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs text-emerald-300"
              >
                ✓ {skill}
              </span>
            ))
          ) : (
            <p className="text-xs text-slate-500">No matched skills yet</p>
          )}
        </div>
      </div>

      {/* Missing Keywords */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-[0.24em]">
            Missing Keywords ({missingSkills.length})
          </h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {missingSkills.length > 0 ? (
            missingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-300"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-xs text-slate-500">Perfect match! No missing keywords.</p>
          )}
        </div>
        {missingSkills.length > 0 && (
          <p className="mt-4 text-xs text-slate-500">
            💡 Tip: Consider adding these missing skills to your resume or cover letter to improve your match score.
          </p>
        )}
      </div>
    </motion.section>
  );
}

export default GapAnalysisPanel;
