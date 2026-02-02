import React, { useState, FormEvent } from 'react';
import { AnalysisRequest } from '../../types/analysis';
import styles from './ResumeForm.module.css';

interface ResumeFormProps {
  loading: boolean;
  onAnalyze: (request: AnalysisRequest) => void;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ loading, onAnalyze }) => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = (event: FormEvent) => {
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
        <div>
          <label className={styles.fieldLabel}>
            <span>Resume</span>
            <span className={styles.helper}>Paste the full text</span>
          </label>
          <textarea
            className={styles.textarea}
            placeholder="Paste your resume here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>

        <div>
          <label className={styles.fieldLabel}>
            <span>Job description</span>
            <span className={styles.helper}>Paste the full posting</span>
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
        <span className={styles.smallLabel}>
          We send both texts for AI analysis.
        </span>
        <button type="submit" className={styles.buttonPrimary} disabled={isDisabled}>
          {loading ? 'Analyzing…' : 'Analyze match'}
        </button>
      </div>
    </form>
  );
};

