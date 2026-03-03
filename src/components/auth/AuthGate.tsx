import React, { useState } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import styles from './AuthGate.module.css';
import {
  fetchGoogleUserId,
  USER_ID_STORAGE_KEY,
  type GoogleTokenResponse,
} from './authHelpers';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

export type AuthMethod = 'google' | 'skip';

interface AuthGateProps {
  onContinue: (method: AuthMethod) => void;
}

function handleGoogleSuccess(
  tokenResponse: GoogleTokenResponse,
  onContinue: (method: AuthMethod) => void
): void {
  const accessToken = tokenResponse.access_token;
  if (accessToken) {
    void (async () => {
      try {
        const userId = await fetchGoogleUserId(accessToken);
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(USER_ID_STORAGE_KEY, userId);
        }
      } catch {
      }
      onContinue('google');
    })();
  } else {
    onContinue('google');
  }
}

const AuthGateWithGoogle: React.FC<AuthGateProps> = ({ onContinue }) => {
  const [loading, setLoading] = useState(false);

  const onSuccess = (tokenResponse: GoogleTokenResponse) => {
    setLoading(false);
    handleGoogleSuccess(tokenResponse, onContinue);
  };

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    ux_mode: 'redirect',
    scope: 'openid email profile',
    onSuccess,
    onError: () => {
      setLoading(false);
    },
    onNonOAuthError: () => {
      setLoading(false);
    },
  } as any);

  const handleGoogleClick = () => {
    setLoading(true);
    googleLogin();
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h1 className={styles.pageTitle}>Welcome</h1>
        <p className={styles.pageSubtitle}>
          Sign in with Google to save results to history, or skip to use the app without saving.
        </p>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.googleButton}
          onClick={handleGoogleClick}
          disabled={loading}
        >
          <GoogleIcon className={styles.googleIcon} />
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>
        <div className={styles.divider}>
          <span>or</span>
        </div>
        <button type="button" className={styles.skipButton} onClick={() => onContinue('skip')}>
          Skip for now
        </button>
      </div>
    </div>
  );
};

const AuthGateSkipOnly: React.FC<AuthGateProps> = ({ onContinue }) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <h1 className={styles.pageTitle}>Welcome</h1>
      <p className={styles.pageSubtitle}>
        Continue to use the resume match analyzer.
      </p>
    </div>
    <div className={styles.actions}>
      <button type="button" className={styles.skipButton} onClick={() => onContinue('skip')}>
        Continue
      </button>
    </div>
  </div>
);

export const AuthGate: React.FC<AuthGateProps> = (props) => {
  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthGateWithGoogle {...props} />
      </GoogleOAuthProvider>
    );
  }
  return <AuthGateSkipOnly {...props} />;
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
