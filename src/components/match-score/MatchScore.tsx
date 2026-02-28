import React from 'react';
import styles from './MatchScore.module.css';

interface MatchScoreProps {
  score?: number | null;
  loading?: boolean;
}

export const MatchScore: React.FC<MatchScoreProps> = ({
  score,
  loading = false,
}) => {
  const hasScore = typeof score === 'number';
  const roundedScore = hasScore ? Math.round(score as number) : null;

  let stateClass = '';

  if (!loading && hasScore) {
    if (roundedScore! >= 75) {
      stateClass = styles.scoreHigh;
    } else if (roundedScore! >= 50) {
      stateClass = styles.scoreMedium;
    } else {
      stateClass = styles.scoreLow;
    }
  }

  return (
    <div className={`${styles.scoreCircle} ${stateClass}`}>
      {loading ? (
        <div className={styles.scoreSpinner} />
      ) : (
        <>
          <span className={styles.scoreValue}>
            {hasScore ? roundedScore : '--'}
          </span>
          <span className={styles.scoreLabel}>
            match score
          </span>
        </>
      )}
    </div>
  );
};