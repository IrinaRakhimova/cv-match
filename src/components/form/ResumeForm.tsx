import React, { useState, useMemo } from 'react';
import { AnalysisRequest } from '../../types/analysis';
import styles from './ResumeForm.module.css';

interface ResumeFormProps {
  loading: boolean;
  onAnalyze: (request: AnalysisRequest) => void;
  onReset?: () => void;
  showNextButton?: boolean;
}

const MAX_RESUME_LENGTH = 10000; 
const MAX_JOB_DESCRIPTION_LENGTH = 5000; 
const MIN_LENGTH = 50; 

const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const sanitizeInput = (text: string): string => {
  return text
    .replace(/\s+/g, ' ') 
    .replace(/\n{3,}/g, '\n\n') 
    .trim();
};

export const ResumeForm: React.FC<ResumeFormProps> = ({ loading, onAnalyze, onReset, showNextButton }) => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const resumeLength = resumeText.length;
  const jobDescriptionLength = jobDescription.length;
  const resumeWords = useMemo(() => countWords(resumeText), [resumeText]);
  const jobDescriptionWords = useMemo(() => countWords(jobDescription), [jobDescription]);

  const resumeTrimmed = resumeText.trim();
  const jobDescriptionTrimmed = jobDescription.trim();

  const isResumeValid = resumeTrimmed.length >= MIN_LENGTH && resumeTrimmed.length <= MAX_RESUME_LENGTH;
  const isJobDescriptionValid = jobDescriptionTrimmed.length >= MIN_LENGTH && jobDescriptionTrimmed.length <= MAX_JOB_DESCRIPTION_LENGTH;

  const resumeWarning = resumeLength > MAX_RESUME_LENGTH * 0.9; 
  const jobDescriptionWarning = jobDescriptionLength > MAX_JOB_DESCRIPTION_LENGTH * 0.9;

  const handleResumeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_RESUME_LENGTH) {
      setResumeText(value);
    }
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_JOB_DESCRIPTION_LENGTH) {
      setJobDescription(value);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isResumeValid || !isJobDescriptionValid || loading) {
      return;
    }

    const payload: AnalysisRequest = {
      resumeText: sanitizeInput(resumeText),
      jobDescription: sanitizeInput(jobDescription),
    };

    onAnalyze(payload);
  };

  const handleNextPosition = () => {
    setResumeText('');
    setJobDescription('');
    onReset?.();
  };

  const isDisabled = loading || !isResumeValid || !isJobDescriptionValid;

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
            <span className={`${styles.charCount} ${resumeWarning ? styles.charCountWarning : ''} ${resumeLength > MAX_RESUME_LENGTH ? styles.charCountError : ''}`}>
              {resumeLength.toLocaleString()} / {MAX_RESUME_LENGTH.toLocaleString()} chars
              {resumeWords > 0 && ` • ${resumeWords.toLocaleString()} words`}
            </span>
          </label>
          {resumeTrimmed.length > 0 && resumeTrimmed.length < MIN_LENGTH && (
            <div className={styles.validationError}>
              Resume must be at least {MIN_LENGTH} characters ({resumeTrimmed.length} / {MIN_LENGTH})
            </div>
          )}
          {resumeLength > MAX_RESUME_LENGTH && (
            <div className={styles.validationError}>
              Resume exceeds maximum length of {MAX_RESUME_LENGTH.toLocaleString()} characters
            </div>
          )}
          <textarea
            className={`${styles.textarea} ${resumeWarning ? styles.textareaWarning : ''} ${resumeLength > MAX_RESUME_LENGTH ? styles.textareaError : ''}`}
            placeholder="Paste your resume here... (min. 50 characters)"
            value={resumeText}
            onChange={handleResumeChange}
            maxLength={MAX_RESUME_LENGTH}
            rows={8}
          />
        </div>

        <div className={styles.fieldJob}>
          <label className={`${styles.fieldLabel} ${styles.fieldLabelJob}`}>
            <span>Job description</span>
            <span className={`${styles.charCount} ${jobDescriptionWarning ? styles.charCountWarning : ''} ${jobDescriptionLength > MAX_JOB_DESCRIPTION_LENGTH ? styles.charCountError : ''}`}>
              {jobDescriptionLength.toLocaleString()} / {MAX_JOB_DESCRIPTION_LENGTH.toLocaleString()} chars
              {jobDescriptionWords > 0 && ` • ${jobDescriptionWords.toLocaleString()} words`}
            </span>
          </label>
          {jobDescriptionTrimmed.length > 0 && jobDescriptionTrimmed.length < MIN_LENGTH && (
            <div className={styles.validationError}>
              Job description must be at least {MIN_LENGTH} characters ({jobDescriptionTrimmed.length} / {MIN_LENGTH})
            </div>
          )}
          {jobDescriptionLength > MAX_JOB_DESCRIPTION_LENGTH && (
            <div className={styles.validationError}>
              Job description exceeds maximum length of {MAX_JOB_DESCRIPTION_LENGTH.toLocaleString()} characters
            </div>
          )}
          <textarea
            className={`${styles.textarea} ${jobDescriptionWarning ? styles.textareaWarning : ''} ${jobDescriptionLength > MAX_JOB_DESCRIPTION_LENGTH ? styles.textareaError : ''}`}
            placeholder="Paste the job description here... (min. 50 characters)"
            value={jobDescription}
            onChange={handleJobDescriptionChange}
            maxLength={MAX_JOB_DESCRIPTION_LENGTH}
            rows={8}
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

