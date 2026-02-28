import React from 'react';
import { AnalysisResult } from '../../types/analysis';
import { LoadingSpinner } from '../loader/LoadingSpinner';
import styles from './AnalysisResult.module.css';
import { SkillsSection } from '../skills-section/SkillsSection';
import { MatchScore } from '../match-score/MatchScore';

interface AnalysisResultProps {
  loading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  onCancel?: () => void;
}

export const AnalysisResultView: React.FC<AnalysisResultProps> = ({
  loading,
  error,
  result,
  onCancel,
}) => {
  return (
    <section className={styles.card}>
      <div className={styles.resultHeader}>
        <MatchScore
          score={result?.matchScore}
          loading={loading}
        />
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
        <LoadingSpinner onCancel={onCancel} />
      )}

      {result && !error && (
        <>
          <SkillsSection
            title="Matching skills"
            skills={result.matchingSkills}
            emptyMessage="No matching skills identified."
            variant="match"
          />

          <SkillsSection
            title="Missing or weak skills"
            skills={result.missingSkills}
            emptyMessage="No clear gaps detected compared to this job posting."
            variant="missing"
          />

          <section className={styles.sectionSpacing}>
            <h3 className={styles.sectionTitle}>Location</h3>
            <div className={styles.comparisonBox}>
              <div className={styles.comparisonRow}>
                <span className={styles.comparisonLabel}>Resume:</span>
                <span className={styles.comparisonValue}>
                  {result.locationComparison.resumeLocation?.trim() || '_'}
                </span>
              </div>
              <div className={styles.comparisonRow}>
                <span className={styles.comparisonLabel}>Job:</span>
                <span className={styles.comparisonValue}>
                  {result.locationComparison.jobLocation?.trim() || '_'}
                </span>
              </div>
              <div className={styles.comparisonRow}>
                <span className={styles.comparisonLabel}>Match:</span>
                <span
                  className={
                    result.locationComparison.resumeLocation?.trim() || result.locationComparison.jobLocation?.trim()
                      ? result.locationComparison.isMatch
                        ? styles.matchYes
                        : styles.matchNo
                      : styles.dataMissing
                  }
                >
                  {result.locationComparison.resumeLocation?.trim() && result.locationComparison.jobLocation?.trim()
                    ? result.locationComparison.isMatch
                      ? 'Yes'
                      : 'No'
                    : 'Data is missing'}
                </span>
              </div>
              {result.locationComparison.notes?.trim() ? (
                <p className={styles.comparisonNotes}>{result.locationComparison.notes}</p>
              ) : (
                <p className={styles.comparisonNotes}>_</p>
              )}
            </div>
          </section>

          <section className={styles.sectionSpacing}>
            <h3 className={styles.sectionTitle}>Experience</h3>
            <div className={styles.comparisonBox}>
              <div className={styles.comparisonRow}>
                <span className={styles.comparisonLabel}>Resume (years):</span>
                <span className={styles.comparisonValue}>
                  {result.experienceComparison.resumeYears > 0
                    ? result.experienceComparison.resumeYears
                    : '_'}
                </span>
              </div>
              <div className={styles.comparisonRow}>
                <span className={styles.comparisonLabel}>Required (years):</span>
                <span className={styles.comparisonValue}>
                  {result.experienceComparison.requiredYears > 0
                    ? result.experienceComparison.requiredYears
                    : '_'}
                </span>
              </div>
              <div className={styles.comparisonRow}>
                <span className={styles.comparisonLabel}>Meets requirement:</span>
                <span
                  className={
                    result.experienceComparison.resumeYears > 0 ||
                      result.experienceComparison.requiredYears > 0
                      ? result.experienceComparison.meetsRequirement
                        ? styles.matchYes
                        : styles.matchNo
                      : styles.dataMissing
                  }
                >
                  {result.experienceComparison.resumeYears > 0 ||
                    result.experienceComparison.requiredYears > 0
                    ? result.experienceComparison.meetsRequirement
                      ? 'Yes'
                      : 'No'
                    : 'Data is missing'}
                </span>
              </div>
              {result.experienceComparison.notes?.trim() ? (
                <p className={styles.comparisonNotes}>{result.experienceComparison.notes}</p>
              ) : (
                <p className={styles.comparisonNotes}>_</p>
              )}
            </div>
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
