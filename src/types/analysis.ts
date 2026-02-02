export interface AnalysisRequest {
  resumeText: string;
  jobDescription: string;
}

export interface AnalysisResult {
  matchScore: number;
  missingSkills: string[];
  suggestions: string[];
  rawResponse?: unknown;
}
