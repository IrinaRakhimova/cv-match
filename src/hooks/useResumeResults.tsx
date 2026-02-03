import { useState, useCallback } from 'react';
import { AnalysisRequest, AnalysisResult } from '../types/analysis';
import { analyzeResumeMatch } from '../services/n8nClient';

interface UseResumeAnalysisState {
  loading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  currentRequest: AnalysisRequest | null;
}

interface UseResumeAnalysis {
  loading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  currentRequest: AnalysisRequest | null;
  analyze: (request: AnalysisRequest) => Promise<void>;
  reset: () => void;
}

export function useResumeAnalysis(): UseResumeAnalysis {
  const [state, setState] = useState<UseResumeAnalysisState>({
    loading: false,
    error: null,
    result: null,
    currentRequest: null,
  });

  const analyze = useCallback(async (request: AnalysisRequest) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      currentRequest: request,
    }));

    try {
      const result = await analyzeResumeMatch(request);

      setState({
        loading: false,
        error: null,
        result,
        currentRequest: request,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unexpected error while analyzing resume.';

      setState({
        loading: false,
        error: message,
        result: null,
        currentRequest: request,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      result: null,
      currentRequest: null,
    });
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    result: state.result,
    currentRequest: state.currentRequest,
    analyze,
    reset,
  };
}

