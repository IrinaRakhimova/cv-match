import React, { useState } from 'react';
import { AnalysisRequest } from '../../types/analysis';
import styles from './ResumeForm.module.css';

interface ResumeFormProps {
  loading: boolean;
  onAnalyze: (request: AnalysisRequest) => void;
  onReset?: () => void;
  showNextButton?: boolean;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ loading, onAnalyze, onReset, showNextButton }) => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resumeText.trim() || !jobDescription.trim() || loading) {
      return;
    }

    const payload: AnalysisRequest = {
      resumeText: resumeText.trim(),
      jobDescription: jobDescription.trim(),
    };

    onAnalyze(payload);
  };

  const handleNextPosition = () => {
    setResumeText('');
    setJobDescription('');
    onReset?.();
  };

  const isDisabled = loading || !resumeText.trim() || !jobDescription.trim();

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h1 className={styles.pageTitle}>Resume match analyzer</h1>
          <p className={styles.pageSubtitle}>
            Paste your resume and a job description to see how well you match and what
            to improve.
          </p>
        </div>
      </div>

      <div className={styles.layoutGrid}>
        <div className={styles.fieldResume}>
          <label className={`${styles.fieldLabel} ${styles.fieldLabelResume}`}>
            <span>Resume</span>
          </label>
          <textarea
            className={styles.textarea}
            placeholder="Paste your resume here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>

        <div className={styles.fieldJob}>
          <label className={`${styles.fieldLabel} ${styles.fieldLabelJob}`}>
            <span>Job description</span>
          </label>
          <textarea
            className={styles.textarea}
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.actionsRow}>
        {showNextButton ? (
          <>
            <button type="button" className={styles.buttonSecondary} onClick={handleNextPosition}>
              Next position
            </button>
            <button type="submit" className={styles.buttonPrimary} disabled={isDisabled}>
              {loading ? 'Analyzing…' : 'Re-analyze'}
            </button>
          </>
        ) : (
          <>
            <span className={styles.smallLabel}>
              We send both texts for AI analysis.
            </span>
            <button type="submit" className={styles.buttonPrimary} disabled={isDisabled}>
              {loading ? 'Analyzing…' : 'Analyze match'}
            </button>
          </>
        )}
      </div>
    </form>
  );
};

