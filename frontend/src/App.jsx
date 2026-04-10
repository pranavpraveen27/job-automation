import { useState } from 'react';
import JobForm from './JobForm.jsx';
import JobList from './JobList.jsx';

function App() {
  const [refreshCount, setRefreshCount] = useState(0);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Autonomous Job Application Agent</h1>
        <p className="text-gray-600 text-lg">Enter a job application URL and watch the automation run.</p>
      </header>

      <main className="grid gap-6">
        <JobForm onJobAdded={() => setRefreshCount((count) => count + 1)} />
        <JobList refreshSignal={refreshCount} />
      </main>
    </div>
  );
}

export default App;
