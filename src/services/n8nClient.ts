import {
  AnalysisRequest,
  AnalysisResult,
  LocationComparison,
  ExperienceComparison,
} from '../types/analysis';
import { sanitizeTextInput, validateTextContent } from '../utils/security';

const N8N_ANALYZE_URL = process.env.API_ANALYZE_URL || process.env.N8N_ANALYZE_URL || '';
const REQUEST_TIMEOUT_MS = 30000; 


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

  if (typeof matchScore !== 'number' || 
    !isStringArray(matchingSkills) || 
    !isStringArray(missingSkills) || 
    !isLocationComparison(locationComparison) ||
    !isExperienceComparison(experienceComparison) ||
    !isStringArray(suggestions)) {
    throw new Error('Invalid response from n8n.');
  }

  return obj as N8nAnalysisResponse;
}

export interface AnalyzeResumeMatchOptions {
  signal?: AbortSignal;
  timeout?: number;
}

export async function analyzeResumeMatch(
  request: AnalysisRequest,
  options?: AnalyzeResumeMatchOptions
): Promise<AnalysisResult> {
  if (!N8N_ANALYZE_URL) {
    throw new Error('N8n analyze URL is not configured (N8N_ANALYZE_URL).');
  }

  const sanitizedResume = sanitizeTextInput(request.resumeText);
  const sanitizedJobDescription = sanitizeTextInput(request.jobDescription);

  const resumeValidation = validateTextContent(sanitizedResume);
  if (!resumeValidation.valid) {
    throw new Error(`Invalid resume content: ${resumeValidation.reason}`);
  }

  const jobValidation = validateTextContent(sanitizedJobDescription);
  if (!jobValidation.valid) {
    throw new Error(`Invalid job description content: ${jobValidation.reason}`);
  }

  const timeoutMs = options?.timeout ?? REQUEST_TIMEOUT_MS;
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, timeoutMs);

  const mergedController = new AbortController();
  const abortHandler = () => mergedController.abort();
  
  timeoutController.signal.addEventListener('abort', abortHandler);
  if (options?.signal) {
    options.signal.addEventListener('abort', abortHandler);
  }

  const signal = mergedController.signal;

  const cleanup = () => {
    clearTimeout(timeoutId);
    timeoutController.signal.removeEventListener('abort', abortHandler);
    if (options?.signal) {
      options.signal.removeEventListener('abort', abortHandler);
    }
  };

  try {
    const response = await fetch(N8N_ANALYZE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: sanitizedResume,
        jobDescription: sanitizedJobDescription,
      }),
      signal,
    });

    cleanup();

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `Analysis request failed with status ${response.status}${
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
  } catch (err) {
    cleanup();

    if (err instanceof Error && err.name === 'AbortError') {
      if (timeoutController.signal.aborted) {
        throw new Error('Request timed out after 30 seconds. Please try again.');
      }
      if (options?.signal?.aborted) {
        throw new Error('Request was cancelled.');
      }
      throw new Error('Request was cancelled.');
    }

    throw err;
  }
}
