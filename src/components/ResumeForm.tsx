import React, { useState, FormEvent } from 'react';
import { AnalysisRequest } from '../types/analysis';

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
    <form onSubmit={handleSubmit} className="card">
      <div className="card-header">
        <div>
          <h1 className="page-title">Resume match analyzer</h1>
          <p className="page-subtitle">
            Paste your resume and a job description to see how well you match and what
            to improve.
          </p>
        </div>
      </div>

      <div className="layout-grid">
        <div>
          <label className="field-label">
            <span>Resume</span>
            <span className="helper">Paste the full text</span>
          </label>
          <textarea
            className="textarea"
            placeholder="Paste your resume here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label">
            <span>Job description</span>
            <span className="helper">Paste the full posting</span>
          </label>
          <textarea
            className="textarea"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="actions-row">
        <span className="small-label">
          We send both texts for AI analysis.
        </span>
        <button type="submit" className="button-primary" disabled={isDisabled}>
          {loading ? 'Analyzing…' : 'Analyze match'}
        </button>
      </div>
    </form>
  );
};

