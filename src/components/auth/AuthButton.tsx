import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '../button/Button';
import {
  fetchGoogleUserId,
  USER_ID_STORAGE_KEY,
  AUTH_METHOD_KEY,
  type GoogleTokenResponse,
} from './authHelpers';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

export type AuthMethod = 'google' | 'skip';

interface AuthButtonProps {
  authMethod: AuthMethod;
  onSignInSuccess: () => void;
  onLogout: () => void;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  authMethod,
  onSignInSuccess,
  onLogout,
}) => {
  const [signingIn, setSigningIn] = useState(false);

  const onSuccess = (tokenResponse: GoogleTokenResponse) => {
    setSigningIn(false);
    const accessToken = tokenResponse.access_token;
    if (accessToken) {
      void (async () => {
        try {
          const userId = await fetchGoogleUserId(accessToken);
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(USER_ID_STORAGE_KEY, userId);
            sessionStorage.setItem(AUTH_METHOD_KEY, 'google');
          }
          onSignInSuccess();
        } catch {
          onSignInSuccess();
        }
      })();
    } else {
      onSignInSuccess();
    }
  };

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    ux_mode: 'redirect',
    scope: 'openid email profile',
    onSuccess,
    onError: () => setSigningIn(false),
    onNonOAuthError: () => setSigningIn(false),
  } as any);

  if (authMethod === 'google') {
    return (
      <Button type="button" variant="secondary" onClick={onLogout}>
        Log out
      </Button>
    );
  }

  if (GOOGLE_CLIENT_ID) {
    return (
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          setSigningIn(true);
          googleLogin();
        }}
        disabled={signingIn}
      >
        {signingIn ? 'Signing in…' : 'Sign in'}
      </Button>
    );
  }

  return null;
};
