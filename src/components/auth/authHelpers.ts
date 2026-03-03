export const USER_ID_STORAGE_KEY = 'slush_user_id';
export const AUTH_METHOD_KEY = 'slush_auth_method';

export interface GoogleTokenResponse {
  access_token?: string;
}

export async function fetchGoogleUserId(accessToken: string): Promise<string> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to get user info');
  const data = (await res.json()) as { id?: string };
  if (!data?.id) throw new Error('No user id in response');
  return String(data.id);
}
