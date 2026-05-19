import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getResumeInsights } from '../services/api';

function AIInsightsPanel({ resumeId, token }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resumeId && token) {
      loadInsights();
    }
  }, [resumeId, token]);

  const loadInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getResumeInsights(resumeId, token);
      if (response.success) {
        setInsights(response.insights || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load insights');
      console.error('Error loading insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-400 bg-red-950/30 border-red-800/50';
      case 'medium':
        return 'text-yellow-400 bg-yellow-950/30 border-yellow-800/50';
      case 'low':
        return 'text-blue-400 bg-blue-950/30 border-blue-800/50';
      default:
        return 'text-slate-400 bg-slate-900/30 border-slate-800/50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <Zap className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] border border-slate-800/70 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">AI Analysis</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Resume Insights</h2>
        </div>
        <button
          type="button"
          onClick={loadInsights}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800/50 bg-red-950/30 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin">
            <div className="h-6 w-6 border-2 border-slate-600 border-t-sky-400 rounded-full"></div>
          </div>
        </div>
      ) : insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-lg border p-4 ${getPriorityColor(insight.priority)}`}
            >
              <div className="flex gap-3">
                <div className="mt-0.5">
                  {getPriorityIcon(insight.priority)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    {insight['Current issue'] || insight.issue || 'Issue'}
                  </h3>
                  <p className="text-sm text-slate-200 mb-2">
                    {insight['Recommended change'] || insight.recommendation || ''}
                  </p>
                  <p className="text-xs text-slate-300 italic">
                    {insight['Why it improves the resume'] || insight.rationale || ''}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-400">No insights available yet. Upload a resume to get started.</p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-slate-800/50 text-xs text-slate-500">
        💡 These AI-powered insights are designed to help you optimize your resume for maximum impact. Review and implement the high-priority changes first.
      </div>
    </motion.section>
  );
}

export default AIInsightsPanel;
