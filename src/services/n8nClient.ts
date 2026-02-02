import { AnalysisRequest, AnalysisResult } from '../types/analysis';

const N8N_ANALYZE_URL = "https://slush-test.app.n8n.cloud/webhook/cv-job-match";

if (!N8N_ANALYZE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    '[n8nClient] VITE_N8N_ANALYZE_URL is not set. Configure your n8n webhook URL in a .env file.',
  );
}

interface N8nAnalysisResponse {
  matchScore: number;
  missingSkills: string[];
  suggestions: string[];
  // Allow additional fields; we only care about the ones above.
  [key: string]: unknown;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function validateN8nResponse(data: unknown): N8nAnalysisResponse {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid response from n8n: expected an object.');
  }

  const obj = data as Record<string, unknown>;
  const { matchScore, missingSkills, suggestions } = obj;

  if (typeof matchScore !== 'number') {
    throw new Error('Invalid response from n8n: matchScore must be a number.');
  }

  if (!isStringArray(missingSkills)) {
    throw new Error('Invalid response from n8n: missingSkills must be a string array.');
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

// 1️⃣ Validate top-level structure
if (!Array.isArray(data) || data.length === 0) {
  throw new Error('Invalid response from n8n: expected a non-empty array.');
}

const firstItem = data[0] as Record<string, unknown>;
const output = firstItem.output;

// 2️⃣ Validate output exists
if (!output) {
  throw new Error('Invalid response from n8n: missing output field.');
}

// 3️⃣ Validate the actual payload
const validated = validateN8nResponse(output);
  return {
    
    matchScore: validated.matchScore,
    missingSkills: validated.missingSkills,
    suggestions: validated.suggestions,
    rawResponse: data,
  };
}
