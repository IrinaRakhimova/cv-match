export interface AnalysisRequest {
  resumeText: string;
  jobDescription: string;
}

export interface LocationComparison {
  resumeLocation: string;
  jobLocation: string;
  isMatch: boolean;
  notes: string;
}

export interface ExperienceComparison {
  resumeYears: number;
  requiredYears: number;
  meetsRequirement: boolean;
  notes: string;
}

export interface AnalysisResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  locationComparison: LocationComparison;
  experienceComparison: ExperienceComparison;
  suggestions: string[];
  rawResponse?: unknown;
}
