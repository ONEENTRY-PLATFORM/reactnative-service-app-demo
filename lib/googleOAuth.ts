import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {useEffect} from 'react';
import {api, storage} from '@/api/defineApi';
import {IAuthEntity} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import {IError} from 'oneentry/dist/base/utils';

// Must be called once before any OAuth flow to unlock the browser modal on
// iOS Safari view controllers. Safe to call multiple times.
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_DISCOVERY: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET;

// Google requires the redirect URI to match one whitelisted in the Cloud
// Console. In Expo Go dev builds this resolves to a proxy URL, in a native
// build to `myapp://…` (from app.json scheme). Both must be added to the
// authorized redirect list of the OAuth client.
export const getRedirectUri = () =>
  AuthSession.makeRedirectUri({
    scheme: 'myapp',
    path: 'auth/callback/google',
  });

export type GoogleOAuthOutcome =
  | {ok: true; auth: IAuthEntity}
  | {ok: false; reason: 'cancelled' | 'no_code' | 'exchange_failed'; error?: IError};

/**
 * Runs the Google OAuth flow end-to-end and exchanges the resulting code for
 * an IAuthEntity via OneEntry's AuthProvider.oauth.
 *
 * WARNING: OneEntry's oauth() method wants a client_secret in the request
 * body. In the web build (nextjs-beauty) that call is made from a Server
 * Action so the secret never reaches the browser. In this RN build the
 * secret is read from EXPO_PUBLIC_GOOGLE_CLIENT_SECRET, which means it will
 * be bundled into the client. This is a KNOWN limitation of running the
 * OneEntry OAuth exchange on-device without a backend proxy. See
 * WEB_PARITY_PLAN.md § "Этап 4" for the backend-proxy alternative.
 */
export async function runGoogleAuth(
  request: AuthSession.AuthRequest | null,
  promptAsync: () => Promise<AuthSession.AuthSessionResult>,
): Promise<GoogleOAuthOutcome> {
  if (!request || !CLIENT_ID || !CLIENT_SECRET) {
    return {ok: false, reason: 'no_code'};
  }

  const result = await promptAsync();

  if (result.type !== 'success') {
    return {ok: false, reason: 'cancelled'};
  }

  const code = result.params.code;
  if (!code) {
    return {ok: false, reason: 'no_code'};
  }

  try {
    const authResult = await api.AuthProvider.oauth('google', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: request.redirectUri,
    });

    if ((authResult as IError)?.statusCode >= 400) {
      return {
        ok: false,
        reason: 'exchange_failed',
        error: authResult as IError,
      };
    }

    const auth = authResult as IAuthEntity;
    if (auth.refreshToken) {
      storage.set('refresh', auth.refreshToken);
    }
    return {ok: true, auth};
  } catch (e: any) {
    return {
      ok: false,
      reason: 'exchange_failed',
      error: {
        statusCode: 500,
        message: e?.message ?? 'oauth exchange threw',
        timestamp: new Date().toISOString(),
        pageData: null,
      },
    };
  }
}

// Convenience hook — mirrors the shape of AuthSession.useAuthRequest so
// callers can just spread the return value.
export function useGoogleAuthRequest() {
  const redirectUri = getRedirectUri();
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID ?? '',
      scopes: ['openid', 'email', 'profile'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    },
    GOOGLE_DISCOVERY,
  );

  // Log when the OAuth client is misconfigured to help debugging.
  useEffect(() => {
    if (!CLIENT_ID) {
      console.warn(
        '[oauth] EXPO_PUBLIC_GOOGLE_CLIENT_ID not set — Google sign-in will fail',
      );
    }
  }, []);

  return {request, response, promptAsync, redirectUri};
}
