import React from 'react';
import { ResumeForm } from './components/ResumeForm';
import { AnalysisResultView } from './components/AnalysisResult';
import { useResumeAnalysis } from './hooks/useResumeResults';

export const App: React.FC = () => {
  const { loading, error, result, analyze } = useResumeAnalysis();

  return (
    <div className="app-shell">
      <ResumeForm loading={loading} onAnalyze={analyze} />
      <AnalysisResultView loading={loading} error={error} result={result} />
    </div>
  );
};

