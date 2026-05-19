import { useCallback, useState } from 'react';
import { UploadCloud, FileText, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { uploadResume } from '../services/api.js';

function UploadBox({ onUploadComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState('Drag & drop your resume PDF here or browse files.');
  const [loading, setLoading] = useState(false);

  const handleUpload = useCallback(
    async (file) => {
      if (!file || file.type !== 'application/pdf') {
        setStatus('Please upload a valid PDF resume.');
        return;
      }

      setLoading(true);
      setStatus('Analyzing resume...');
      try {
        const response = await uploadResume(file);
        onUploadComplete(response);
        setStatus('Resume analyzed successfully. Skills extracted.');
      } catch (error) {
        setStatus(error.message || 'Unable to process resume.');
      } finally {
        setLoading(false);
      }
    },
    [onUploadComplete]
  );

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    await handleUpload(file);
  };

  const handleChange = async (event) => {
    const file = event.target.files[0];
    await handleUpload(file);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="rounded-[2rem] border border-dashed border-slate-700/90 bg-slate-950/80 p-8 text-slate-300 shadow-2xl shadow-slate-950/20"
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-sky-400">
          <UploadCloud className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Upload Your Resume</h3>
          <p className="mt-2 text-sm text-slate-400">Get instant AI skill extraction and job match insights.</p>
        </div>
      </div>

      <div className={`mt-8 rounded-3xl border p-6 ${dragActive ? 'border-sky-500 bg-slate-900/80' : 'border-slate-800 bg-slate-950/70'}`}>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl bg-slate-900 px-5 py-8 text-slate-300 transition hover:bg-slate-800">
          <FileText className="h-6 w-6 text-sky-400" />
          <span className="text-sm">Drop a PDF file here</span>
          <span className="text-xs text-slate-500">Only PDF resumes are supported.</span>
          <input type="file" accept="application/pdf" className="hidden" onChange={handleChange} />
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/90 px-5 py-4 text-sm text-slate-400">
        <span>{loading ? 'Analyzing...' : status}</span>
        <ArrowUpRight className="h-4 w-4 text-slate-400" />
      </div>
    </motion.div>
  );
}

export default UploadBox;
