import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  onCancel?: () => void;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ onCancel }) => {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Analyzing via n8n…</p>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
          aria-label="Cancel analysis"
        >
          Cancel
        </button>
      )}
    </div>
  );
};
