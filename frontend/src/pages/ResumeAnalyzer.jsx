import { motion } from 'framer-motion';
import { FileText, Upload, RefreshCw, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { uploadResume, getResumeCritique, getResumeInsights, getResumeScore } from '../services/api.js';

function ResumeAnalyzer() {
  const token = localStorage.getItem('token');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [critique, setCritique] = useState(null);
  const [score, setScore] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('insights');

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setLoading(true);
    setMessage('');
    try {
      const result = await uploadResume(selectedFile, token);
      setResumeData(result);
      setMessage('Resume uploaded successfully! Analyzing...');
      
      // Load analysis data
      if (result._id) {
        const [insightsRes, critiqueRes, scoreRes] = await Promise.all([
          getResumeInsights(result._id, token).catch(() => null),
          getResumeCritique(result._id, token).catch(() => null),
          getResumeScore(result._id, token).catch(() => null),
        ]);
        
        setInsights(insightsRes?.data || insightsRes);
        setCritique(critiqueRes?.data || critiqueRes);
        setScore(scoreRes?.data || scoreRes);
      }
    } catch (error) {
      setMessage(error.message || 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'insights', label: 'Improvements' },
    { id: 'critique', label: 'Formatting' },
    { id: 'score', label: 'Score' },
  ];

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
            <p className="text-sm uppercase tracking-[0.34em] text-sky-400/80">AI Analysis</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Resume Analyzer</h2>
            <p className="mt-2 max-w-2xl text-slate-400">Upload your resume to get AI-powered insights on improvements, formatting feedback, and overall quality score.</p>
          </div>
          <FileText className="h-12 w-12 text-sky-400/40" />
        </div>

        {message && (
          <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            message.includes('Failed') 
              ? 'border-red-500/30 bg-red-500/10 text-red-400'
              : 'border-sky-500/30 bg-sky-500/10 text-sky-400'
          }`}>
            {message}
          </div>
        )}
      </section>

      {/* Upload Area */}
      <motion.section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl">
        <label className="block cursor-pointer">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-700 py-12 text-center transition hover:border-slate-600 hover:bg-slate-900/30">
            <Upload className={`h-12 w-12 ${loading ? 'animate-pulse text-slate-500' : 'text-sky-400/60'}`} />
            <div>
              <p className="text-lg font-semibold text-white">
                {loading ? 'Analyzing...' : 'Upload Resume'}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                PDF or Word documents (.pdf, .doc, .docx)
              </p>
            </div>
          </div>
        </label>
      </motion.section>

      {/* Analysis Results */}
      {resumeData && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl"
        >
          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-slate-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-semibold transition border-b-2 ${
                  activeTab === tab.id
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeTab === 'insights' && insights && (
              <div className="space-y-3">
                {Array.isArray(insights) ? (
                  insights.map((insight, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
                      <p className="text-slate-300">{insight}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
                    <p className="text-slate-400">{insights.message || 'No insights available'}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'critique' && critique && (
              <div className="space-y-3">
                {Array.isArray(critique) ? (
                  critique.map((item, idx) => (
                    <div key={idx} className="rounded-lg border border-amber-700/30 bg-amber-900/20 p-4">
                      <p className="text-amber-200">{item}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-amber-700/30 bg-amber-900/20 p-4">
                    <p className="text-amber-200">{critique.message || 'No critique available'}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'score' && score && (
              <div className="space-y-4">
                {score.total_score && (
                  <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/20 p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-white">Overall Score</span>
                      <span className="text-3xl font-bold text-emerald-400">{score.total_score}/100</span>
                    </div>
                  </div>
                )}
                {Array.isArray(score.categories) && (
                  <div className="space-y-2">
                    {score.categories.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-slate-300">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 rounded-full bg-slate-700">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                              style={{ width: `${cat.score}%` }}
                            />
                          </div>
                          <span className="w-12 text-right text-sm text-slate-400">{cat.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!insights && !critique && !score && (
              <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4 text-center">
                <p className="text-slate-400">Loading analysis...</p>
              </div>
            )}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}

export default ResumeAnalyzer;
