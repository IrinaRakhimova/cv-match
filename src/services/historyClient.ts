const API_BASE = '/api';
const USER_ID_STORAGE_KEY = 'slush_user_id';

function getHistoryHeaders(): HeadersInit {
  const headers: HeadersInit = {};
  if (typeof sessionStorage !== 'undefined') {
    const userId = sessionStorage.getItem(USER_ID_STORAGE_KEY);
    if (userId) (headers as Record<string, string>)['X-User-Id'] = userId;
  }
  return headers;
}

export interface HistoryEntrySummary {
  id: number;
  matchScore: number | null;
  createdAt: string;
  jobDescriptionSnippet: string;
  resumeSnippet: string;
}

export interface HistoryEntryFull {
  id: number;
  resumeText: string;
  jobDescription: string;
  result: {
    matchScore: number;
    matchingSkills: string[];
    missingSkills: string[];
    locationComparison: unknown;
    experienceComparison: unknown;
    suggestions: string[];
  };
  createdAt: string;
}

export async function fetchHistoryList(): Promise<HistoryEntrySummary[]> {
  const res = await fetch(`${API_BASE}/history`, { headers: getHistoryHeaders() });
  if (!res.ok) {
    throw new Error('Failed to load history.');
  }
  return res.json();
}

export async function fetchHistoryEntry(id: number): Promise<HistoryEntryFull | null> {
  const res = await fetch(`${API_BASE}/history/${id}`, { headers: getHistoryHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error('Failed to load history entry.');
  }
  return res.json();
}
