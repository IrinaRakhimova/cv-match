import React from 'react';
import { AnalysisResult } from '../types/analysis';

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
    <section className="card">
      <div className="result-header">
        <div>
          <h2 className="section-title">Match insights</h2>
          <p className="section-subtitle">
            Match score, missing skills, and concrete resume improvements powered by LLM flow.
          </p>
        </div>
        <div className="score-circle">
          <span className="value">
            {result ? Math.round(result.matchScore) : loading ? '…' : '--'}
          </span>
          <span className="label">match score</span>
        </div>
      </div>

      {error && (
        <div className="error-box">
          <strong>Something went wrong.</strong> {error}
        </div>
      )}

      {!error && !result && !loading && (
        <p className="muted">
          Run an analysis to see how well your resume aligns to this role and what you
          should tweak.
        </p>
      )}

      {loading && (
        <p className="muted">
          Analyzing via n8n… this may take a few seconds.
        </p>
      )}

      {result && !error && (
        <>
          <section>
            <h3 className="section-title">Missing or weak skills</h3>
            {result.missingSkills.length === 0 ? (
              <p className="muted">No clear gaps detected compared to this job posting.</p>
            ) : (
              <div className="pill-row">
                {result.missingSkills.map((skill) => (
                  <span className="pill" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section style={{ marginTop: '1rem' }}>
            <h3 className="section-title">Suggested resume improvements</h3>
            {result.suggestions.length === 0 ? (
              <p className="muted">
                Your resume already covers the key requirements for this role.
              </p>
            ) : (
              <ul className="bullet-list">
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
