import React from 'react';
import { ResumeForm } from './components/form/ResumeForm';
import { AnalysisResultView } from './components/result/AnalysisResult';
import { useResumeAnalysis } from './hooks/useResumeResults';
import styles from './App.module.css';

export const App: React.FC = () => {
  const { loading, error, result, analyze } = useResumeAnalysis();

  return (
    <div className={styles.appShell}>
      <ResumeForm loading={loading} onAnalyze={analyze} />
      <AnalysisResultView loading={loading} error={error} result={result} />
    </div>
  );
};

