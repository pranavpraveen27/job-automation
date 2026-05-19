import { motion } from 'framer-motion';
import { Copy, RefreshCcw, Download } from 'lucide-react';
import { useState } from 'react';
import { downloadCoverLetterPDF } from '../services/api';

function CoverLetterPanel({ coverLetter, onRegenerate, applicationId, token, isLoading }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!applicationId || !token) {
      alert('Please save the application first before downloading');
      return;
    }

    setDownloading(true);
    try {
      const blob = await downloadCoverLetterPDF(applicationId, token);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cover-letter-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF: ' + error.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] border border-slate-800/70 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Cover Letter</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">AI-generated response</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCcw className="h-4 w-4" />
            {isLoading ? 'Generating...' : 'Regenerate'}
          </button>
          {applicationId && token && (
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading || !coverLetter}
              className="inline-flex items-center gap-2 rounded-full bg-sky-600/20 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-600/30 disabled:opacity-50 border border-sky-700/50"
            >
              <Download className="h-4 w-4" />
              {downloading ? 'Downloading...' : 'PDF'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-slate-800/80 bg-slate-950/80 p-6 text-sm leading-7 text-slate-300">
        {coverLetter ? (
          <p>{coverLetter}</p>
        ) : (
          <p className="text-slate-500">Upload your resume and select a job to generate a polished AI cover letter.</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>Optimized for modern SaaS applications and recruiter-friendly tone.</span>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(coverLetter || '')}
          disabled={!coverLetter}
          className="inline-flex items-center gap-2 text-slate-300 transition hover:text-white disabled:opacity-50"
        >
          <Copy className="h-4 w-4" />
          Copy
        </button>
      </div>
    </motion.section>
  );
}

export default CoverLetterPanel;
