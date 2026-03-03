import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchHistoryList,
  fetchHistoryEntry,
  HistoryEntrySummary,
  HistoryEntryFull,
} from '../../services/historyClient';
import { AnalysisResultView } from '../result/AnalysisResult';
import { Button } from '../button/Button';
import type { AnalysisResult } from '../../types/analysis';
import styles from './HistoryPage.module.css';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const time = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${date}, ${time}`;
  } catch {
    return iso;
  }
}

interface HistoryPageProps {
  onBack: () => void;
  authButton?: React.ReactNode;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onBack, authButton }) => {
  const [list, setList] = useState<HistoryEntrySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<HistoryEntryFull | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistoryList();
      setList(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const openDetail = useCallback(async (id: number) => {
    setDetailId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const entry = await fetchHistoryEntry(id);
      setDetail(entry);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetailId(null);
    setDetail(null);
  }, []);

  if (detailId != null) {
    const resultForView: AnalysisResult | null = detail?.result
      ? {
          matchScore: detail.result.matchScore,
          matchingSkills: detail.result.matchingSkills ?? [],
          missingSkills: detail.result.missingSkills ?? [],
          locationComparison:
            'locationComparison' in detail.result && detail.result.locationComparison
              ? detail.result.locationComparison as AnalysisResult['locationComparison']
              : {
                  resumeLocation: '',
                  jobLocation: '',
                  isMatch: false,
                  notes: '',
                },
          experienceComparison:
            'experienceComparison' in detail.result && detail.result.experienceComparison
              ? detail.result.experienceComparison as AnalysisResult['experienceComparison']
              : {
                  resumeYears: 0,
                  requiredYears: 0,
                  meetsRequirement: false,
                  notes: '',
                },
          suggestions: detail.result.suggestions ?? [],
        }
      : null;

    return (
      <div>
        <div className={styles.detailBack}>
          <Button type="button" variant="secondary" onClick={closeDetail}>
            ← Back to history
          </Button>
        </div>
        <div className={styles.detailCard}>
          {detail && (
            <>
              <p className={styles.pageTitle} style={{ marginBottom: '0.5rem' }}>
                Analysis from {formatDate(detail.createdAt)}
              </p>
              <AnalysisResultView
                loading={detailLoading}
                error={null}
                result={resultForView}
              />
            </>
          )}
          {detailLoading && !detail && <div className={styles.loading}>Loading…</div>}
          {!detailLoading && !detail && (
            <div className={styles.error}>Could not load this entry.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>History</h1>
        <div className={styles.headerActions}>
          {authButton}
          <Button type="button" variant="secondary" onClick={onBack}>
            ← New analysis
          </Button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Loading history…</div>
        ) : list.length === 0 ? (
          <div className={styles.empty}>
            No analyses yet. Run a resume match to see results here.
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Match</th>
                  <th>Job description</th>
                  <th>Resume</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.createdAt)}</td>
                    <td className={styles.scoreCell}>
                      {row.matchScore != null ? `${row.matchScore}%` : '—'}
                    </td>
                    <td className={styles.snippet} title={row.jobDescriptionSnippet}>
                      {row.jobDescriptionSnippet || '—'}
                    </td>
                    <td className={styles.snippet} title={row.resumeSnippet}>
                      {row.resumeSnippet || '—'}
                    </td>
                    <td>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => openDetail(row.id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
