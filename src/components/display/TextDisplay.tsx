import React from 'react';
import { AnalysisRequest } from '../../types/analysis';
import styles from './TextDisplay.module.css';

interface TextDisplayProps {
  request: AnalysisRequest;
}

export const TextDisplay: React.FC<TextDisplayProps> = ({ request }) => {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Resume</h3>
        <div className={styles.textContent}>{request.resumeText}</div>
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Job Description</h3>
        <div className={styles.textContent}>{request.jobDescription}</div>
      </div>
    </div>
  );
};
