import React from 'react';
import { AnalysisResult } from '../../types/analysis';
import styles from './AnalysisResult.module.css';

interface AnalysisResultProps {
  loading: boolean;
  error: string | null;
  result: AnalysisResult | null;
}

export const AnalysisResultView: React.FC<AnalysisResultProps> = ({
  loading,
  error,
  result,
}) => {
  return (
    <section className={styles.card}>
      <div className={styles.resultHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Match insights</h2>
          <p className={styles.sectionSubtitle}>
            Match score, missing skills, and concrete resume improvements powered by LLM flow.
          </p>
        </div>
        <div className={styles.scoreCircle}>
          <span className={styles.scoreValue}>
            {result ? Math.round(result.matchScore) : loading ? '…' : '--'}
          </span>
          <span className={styles.scoreLabel}>match score</span>
        </div>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <strong>Something went wrong.</strong> {error}
        </div>
      )}

      {!error && !result && !loading && (
        <p className={styles.muted}>
          Run an analysis to see how well your resume aligns to this role and what you
          should tweak.
        </p>
      )}

      {loading && (
        <p className={styles.muted}>
          Analyzing via n8n… this may take a few seconds.
        </p>
      )}

      {result && !error && (
        <>
          <section>
            <h3 className={styles.sectionTitle}>Missing or weak skills</h3>
            {result.missingSkills.length === 0 ? (
              <p className={styles.muted}>No clear gaps detected compared to this job posting.</p>
            ) : (
              <div className={styles.pillRow}>
                {result.missingSkills.map((skill) => (
                  <span className={styles.pill} key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className={styles.sectionSpacing}>
            <h3 className={styles.sectionTitle}>Suggested resume improvements</h3>
            {result.suggestions.length === 0 ? (
              <p className={styles.muted}>
                Your resume already covers the key requirements for this role.
              </p>
            ) : (
              <ul className={styles.bulletList}>
                {result.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </section>
  );
};
