import React, { useState } from 'react';
import { AnalysisRequest } from '../../types/analysis';
import { sanitizeTextInput } from '../../utils/security';
import styles from './ResumeForm.module.css';
import { TextArea } from '../text-area/TextArea';
import { Button } from '../button/Button';

interface ResumeFormProps {
  loading: boolean;
  onAnalyze: (request: AnalysisRequest) => void;
  onReset?: () => void;
  canMakeRequest?: boolean;
  remainingRequests?: number;
}

const MAX_RESUME_LENGTH = 10000;
const MAX_JOB_DESCRIPTION_LENGTH = 5000;
const MIN_LENGTH = 50;

const isValidText = (text: string, max: number) => {
  const trimmed = text.trim();
  return trimmed.length >= MIN_LENGTH && trimmed.length <= max;
};

export const ResumeForm: React.FC<ResumeFormProps> = ({
  loading,
  onAnalyze,
  canMakeRequest = true,
  remainingRequests = 10,
}) => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');


  const isResumeValid = isValidText(resumeText, MAX_RESUME_LENGTH);
  const isJobDescriptionValid = isValidText(jobDescription, MAX_JOB_DESCRIPTION_LENGTH);


  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isResumeValid || !isJobDescriptionValid || loading) {
      return;
    }

    const payload: AnalysisRequest = {
      resumeText: sanitizeTextInput(resumeText),
      jobDescription: sanitizeTextInput(jobDescription),
    };

    onAnalyze(payload);
  };

  const isDisabled =
    loading ||
    !canMakeRequest ||
    !isResumeValid ||
    !isJobDescriptionValid;

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
          <TextArea
            name="Resume"
            value={resumeText}
            onChange={setResumeText}
            minTextLength={MIN_LENGTH}
            maxTextLength={MAX_RESUME_LENGTH}
          />
        </div>

        <div className={styles.fieldJob}>
          <TextArea
            name="Job description"
            value={jobDescription}
            onChange={setJobDescription}
            minTextLength={MIN_LENGTH}
            maxTextLength={MAX_JOB_DESCRIPTION_LENGTH}
          />
        </div>
      </div>

      <div className={styles.actionsRow}>
          <div className={styles.infoSection}>
            <span className={styles.smallLabel}>
              We send both texts for AI analysis.
            </span>
            {remainingRequests < 5 && remainingRequests > 0 && (
              <span className={styles.rateLimitInfo}>
                {remainingRequests} request{remainingRequests !== 1 ? 's' : ''} remaining
              </span>
            )}
          </div>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={isDisabled}
        >
          Analyze match
        </Button>
      </div>
    </form>
  );
};

