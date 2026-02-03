import {
  AnalysisRequest,
  AnalysisResult,
  LocationComparison,
  ExperienceComparison,
} from '../types/analysis';

const N8N_ANALYZE_URL = "https://slush-test.app.n8n.cloud/webhook/cv-job-match";


interface N8nAnalysisResponse {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  locationComparison: LocationComparison;
  experienceComparison: ExperienceComparison;
  suggestions: string[];
  [key: string]: unknown;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isLocationComparison(value: unknown): value is LocationComparison {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.resumeLocation === 'string' &&
    typeof o.jobLocation === 'string' &&
    typeof o.isMatch === 'boolean' &&
    typeof o.notes === 'string'
  );
}

function isExperienceComparison(value: unknown): value is ExperienceComparison {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.resumeYears === 'number' &&
    typeof o.requiredYears === 'number' &&
    typeof o.meetsRequirement === 'boolean' &&
    typeof o.notes === 'string'
  );
}

function validateN8nResponse(data: unknown): N8nAnalysisResponse {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid response from n8n: expected an object.');
  }

  const obj = data as Record<string, unknown>;
  const {
    matchScore,
    matchingSkills,
    missingSkills,
    locationComparison,
    experienceComparison,
    suggestions,
  } = obj;

  if (typeof matchScore !== 'number') {
    throw new Error('Invalid response from n8n: matchScore must be a number.');
  }

  if (!isStringArray(matchingSkills)) {
    throw new Error('Invalid response from n8n: matchingSkills must be a string array.');
  }

  if (!isStringArray(missingSkills)) {
    throw new Error('Invalid response from n8n: missingSkills must be a string array.');
  }

  if (!isLocationComparison(locationComparison)) {
    throw new Error('Invalid response from n8n: locationComparison must be a valid object.');
  }

  if (!isExperienceComparison(experienceComparison)) {
    throw new Error('Invalid response from n8n: experienceComparison must be a valid object.');
  }

  if (!isStringArray(suggestions)) {
    throw new Error('Invalid response from n8n: suggestions must be a string array.');
  }

  return obj as N8nAnalysisResponse;
}

export async function analyzeResumeMatch(request: AnalysisRequest): Promise<AnalysisResult> {
  if (!N8N_ANALYZE_URL) {
    throw new Error('N8n analyze URL is not configured (VITE_N8N_ANALYZE_URL).');
  }

  const response = await fetch(N8N_ANALYZE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      resumeText: request.resumeText,
      jobDescription: request.jobDescription,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `n8n call failed with status ${response.status}${
        text ? `: ${text.slice(0, 200)}` : ''
      }`,
    );
  }

  const data = (await response.json()) as unknown;

if (!Array.isArray(data) || data.length === 0) {
  throw new Error('Invalid response from n8n: expected a non-empty array.');
}

const firstItem = data[0] as Record<string, unknown>;
const output = firstItem.output;

if (!output) {
  throw new Error('Invalid response from n8n: missing output field.');
}

const validated = validateN8nResponse(output);
  const result: AnalysisResult = {
    matchScore: validated.matchScore,
    matchingSkills: validated.matchingSkills,
    missingSkills: validated.missingSkills,
    locationComparison: validated.locationComparison,
    experienceComparison: validated.experienceComparison,
    suggestions: validated.suggestions,
    rawResponse: data,
  };
  return result;
}
