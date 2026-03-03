import React, { useState, useCallback, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ResumeForm } from './components/form/ResumeForm';
import { AnalysisResultView } from './components/result/AnalysisResult';
import { TextDisplay } from './components/display/TextDisplay';
import { AuthGate } from './components/auth/AuthGate';
import { AuthButton } from './components/auth/AuthButton';
import { HistoryPage } from './components/history/HistoryPage';
import { Button } from './components/button/Button';
import { useResumeAnalysis } from './hooks/useResumeResults';
import styles from './App.module.css';

const AUTH_GATE_KEY = 'slush_auth_passed';
const AUTH_METHOD_KEY = 'slush_auth_method';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

export const App: React.FC = () => {
  const [hasPassedGate, setHasPassedGate] = useState(false);
  const [authMethod, setAuthMethod] = useState<'google' | 'skip' | null>(null);
  const [view, setView] = useState<'analyzer' | 'history'>('analyzer');

  useEffect(() => {
    try {
      const passed = sessionStorage.getItem(AUTH_GATE_KEY) === '1';
      setHasPassedGate(passed);
      if (passed) {
        const method = sessionStorage.getItem(AUTH_METHOD_KEY);
        setAuthMethod(method === 'google' || method === 'skip' ? method : 'skip');
      } else {
        setAuthMethod(null);
      }
    } catch {
      setHasPassedGate(false);
      setAuthMethod(null);
    }
  }, []);

  const handlePassGate = useCallback((method: 'google' | 'skip') => {
    try {
      sessionStorage.setItem(AUTH_GATE_KEY, '1');
      sessionStorage.setItem(AUTH_METHOD_KEY, method);
      if (method === 'skip') {
        sessionStorage.removeItem('slush_user_id');
      }
    } catch {
    }
    setHasPassedGate(true);
    setAuthMethod(method);
  }, []);

  const handleLogout = useCallback(() => {
    try {
      sessionStorage.removeItem(AUTH_GATE_KEY);
      sessionStorage.removeItem(AUTH_METHOD_KEY);
      sessionStorage.removeItem('slush_user_id');
    } catch {
    }
    setHasPassedGate(false);
    setAuthMethod(null);
  }, []);

  const handleSignInSuccess = useCallback(() => {
    setAuthMethod('google');
  }, []);

  const { loading, error, result, currentRequest, analyze, cancel, reset, canMakeRequest, remainingRequests } = useResumeAnalysis();
  const hasAnalysis = currentRequest !== null;

  const handleNextPosition = () => {
    reset();
  };

  if (!hasPassedGate) {
    return (
      <div className={`${styles.appShell} ${styles.appShellStartPage}`}>
        <div className={styles.startPageContainer}>
          <AuthGate onContinue={handlePassGate} />
        </div>
      </div>
    );
  }

  const authButton =
    authMethod !== null ? (
      GOOGLE_CLIENT_ID ? (
        <AuthButton
          authMethod={authMethod}
          onSignInSuccess={handleSignInSuccess}
          onLogout={handleLogout}
        />
      ) : (
        authMethod === 'google' ? (
          <Button type="button" variant="secondary" onClick={handleLogout}>
            Log out
          </Button>
        ) : null
      )
    ) : null;

  const mainContent = (
    <>
      {view === 'history' ? (
        <div className={styles.appShell}>
          <HistoryPage
            onBack={() => setView('analyzer')}
            authButton={authButton}
          />
        </div>
      ) : (
        <div className={`${styles.appShell} ${!hasAnalysis ? styles.appShellStartPage : ''}`}>
          {!hasAnalysis ? (
            <>
              <div className={styles.headerWithButton}>
                <h1 className={styles.pageTitle}>Resume match analyzer</h1>
                <div className={styles.headerActions}>
                  <Button type="button" variant="secondary" onClick={() => setView('history')}>
                    History
                  </Button>
                  {authButton}
                </div>
              </div>
              <div className={styles.startPageContainer}>
                <ResumeForm
                  loading={loading}
                  onAnalyze={analyze}
                  canMakeRequest={canMakeRequest}
                  remainingRequests={remainingRequests}
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.headerWithButton}>
                <h1 className={styles.pageTitle}>Resume Match Analysis</h1>
                <div className={styles.headerActions}>
                  <Button type="button" variant="secondary" onClick={() => setView('history')}>
                    History
                  </Button>
                  {authButton}
                  <Button type="button" variant="primary" onClick={handleNextPosition}>
                    Analyze next position
                  </Button>
                </div>
              </div>
              <AnalysisResultView loading={loading} error={error} result={result} onCancel={cancel} />
              <TextDisplay request={currentRequest} />
            </>
          )}
        </div>
      )}
    </>
  );

  return GOOGLE_CLIENT_ID ? (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {mainContent}
    </GoogleOAuthProvider>
  ) : (
    mainContent
  );
};

