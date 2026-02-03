import { useState, useCallback, useRef } from 'react';
import { AnalysisRequest, AnalysisResult } from '../types/analysis';
import { analyzeResumeMatch } from '../services/n8nClient';
import { rateLimiter } from '../utils/security';

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
  cancel: () => void;
  reset: () => void;
  canMakeRequest: boolean;
  remainingRequests: number;
}

export function useResumeAnalysis(): UseResumeAnalysis {
  const [state, setState] = useState<UseResumeAnalysisState>({
    loading: false,
    error: null,
    result: null,
    currentRequest: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const analyze = useCallback(async (request: AnalysisRequest) => {
    if (!rateLimiter.canMakeRequest()) {
      const timeUntilReset = rateLimiter.getTimeUntilReset();
      const seconds = Math.ceil(timeUntilReset / 1000);
      setState((prev) => ({
        ...prev,
        error: `Too many requests. Please wait ${seconds} second${seconds !== 1 ? 's' : ''} before trying again.`,
      }));
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      currentRequest: request,
    }));

    rateLimiter.recordRequest();

    try {
      const result = await analyzeResumeMatch(request, {
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        setState({
          loading: false,
          error: null,
          result,
          currentRequest: request,
        });
      }
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }

      let message = 'Unexpected error while analyzing resume.';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          message = 'Request was cancelled.';
        } else {
          message = err.message;
        }
      }

      setState({
        loading: false,
        error: message,
        result: null,
        currentRequest: request,
      });
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

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
    cancel,
    reset,
    canMakeRequest: rateLimiter.canMakeRequest(),
    remainingRequests: rateLimiter.getRemainingRequests(),
  };
}

