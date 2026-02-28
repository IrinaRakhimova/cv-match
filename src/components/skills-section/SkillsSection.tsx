import React from 'react';
import styles from './SkillsSection.module.css';

interface SkillsSectionProps {
  title: string;
  skills: string[];
  emptyMessage: string;
  variant?: 'match' | 'missing';
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  title,
  skills,
  emptyMessage,
  variant = 'missing',
}) => {
  const pillClass =
    variant === 'match'
      ? styles.pillMatch
      : styles.pill;

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>

      {skills.length === 0 ? (
        <p className={styles.muted}>{emptyMessage}</p>
      ) : (
        <div className={styles.pillRow}>
          {skills.map((skill) => (
            <span key={skill} className={pillClass}>
              {skill}
            </span>
          ))}
        </div>
      )}
    </section>
  );
};