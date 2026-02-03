import React from 'react';
import { ResumeForm } from './components/form/ResumeForm';
import { AnalysisResultView } from './components/result/AnalysisResult';
import { TextDisplay } from './components/display/TextDisplay';
import { useResumeAnalysis } from './hooks/useResumeResults';
import styles from './App.module.css';

export const App: React.FC = () => {
  const { loading, error, result, currentRequest, analyze, cancel, reset, canMakeRequest, remainingRequests } = useResumeAnalysis();
  const hasAnalysis = currentRequest !== null;

  const handleNextPosition = () => {
    reset();
  };

  return (
    <div className={`${styles.appShell} ${!hasAnalysis ? styles.appShellStartPage : ''}`}>
      {!hasAnalysis ? (
        <div className={styles.startPageContainer}>
          <ResumeForm 
            loading={loading} 
            onAnalyze={analyze} 
            canMakeRequest={canMakeRequest}
            remainingRequests={remainingRequests}
          />
        </div>
      ) : (
        <>
          <div className={styles.headerWithButton}>
            <h1 className={styles.pageTitle}>Resume Match Analysis</h1>
            <button onClick={handleNextPosition} className={styles.nextButton}>
              Analyze next position
            </button>
          </div>
          <AnalysisResultView loading={loading} error={error} result={result} onCancel={cancel} />
          <TextDisplay request={currentRequest} />
        </>
      )}
    </div>
  );
};

