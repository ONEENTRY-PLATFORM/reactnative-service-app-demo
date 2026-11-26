import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {api, AUTH_PROVIDER_KEY, storage} from '@/api/defineApi';
import {IAuthEntity} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import {IError} from 'oneentry/dist/base/utils';

// Native Google Sign-In (Credential Manager on Android, Google Sign-In SDK on
// iOS). The OAuth clients live in the Google Cloud project behind your
// Firebase project: a web client, an iOS client and one Android
// client per signing certificate (Play signing, upload key, debug).
//
// The sign-in returns a one-time `serverAuthCode` issued for the WEB client;
// OneEntry's `google` provider exchanges it for the profile. OneEntry expects
// the client secret in that request (the web storefront makes the same call
// from a server action), and this app has no backend of its own, so the
// secret ships in the build — a known trade-off of the platform's flow.
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET;

/** Whether this build carries a Google OAuth configuration. */
export const isGoogleSignInConfigured = (): boolean =>
  Boolean(WEB_CLIENT_ID && IOS_CLIENT_ID && CLIENT_SECRET);

let configured = false;
const ensureConfigured = () => {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    // Required for `serverAuthCode`.
    offlineAccess: true,
    scopes: ['email', 'profile'],
  });
  configured = true;
};

export type GoogleOAuthOutcome =
  | {ok: true; auth: IAuthEntity}
  | {
      ok: false;
      reason: 'unsupported' | 'cancelled' | 'no_code' | 'exchange_failed';
      error?: IError;
    };

const failure = (message: string): IError => ({
  statusCode: 500,
  message,
  timestamp: new Date().toISOString(),
  pageData: null,
});

export async function runGoogleAuth(): Promise<GoogleOAuthOutcome> {
  if (!isGoogleSignInConfigured()) {
    return {ok: false, reason: 'unsupported'};
  }
  ensureConfigured();

  let code: string | null = null;
  try {
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    // Always show the account chooser: a cached account would skip it, and the
    // user could not switch accounts after signing out.
    await GoogleSignin.signOut().catch(() => undefined);
    const response = await GoogleSignin.signIn();
    if (response.type !== 'success') {
      return {ok: false, reason: 'cancelled'};
    }
    code = response.data.serverAuthCode;
  } catch (e) {
    if (
      isErrorWithCode(e) &&
      (e.code === statusCodes.SIGN_IN_CANCELLED ||
        e.code === statusCodes.IN_PROGRESS)
    ) {
      return {ok: false, reason: 'cancelled'};
    }
    return {
      ok: false,
      reason: 'exchange_failed',
      error: failure((e as Error)?.message ?? 'Google sign-in failed'),
    };
  }
  if (!code) {
    return {ok: false, reason: 'no_code'};
  }

  try {
    const authResult = await api.AuthProvider.oauth('google', {
      client_id: WEB_CLIENT_ID as string,
      client_secret: CLIENT_SECRET as string,
      code,
      grant_type: 'authorization_code',
      // A server auth code from the native SDKs is exchanged without a
      // redirect URI.
      redirect_uri: '',
    });
    if ((authResult as IError)?.statusCode >= 400) {
      return {
        ok: false,
        reason: 'exchange_failed',
        error: authResult as IError,
      };
    }
    const auth = authResult as IAuthEntity;
    if (!auth.accessToken) {
      return {
        ok: false,
        reason: 'exchange_failed',
        error: failure('OAuth succeeded but no access token was returned'),
      };
    }
    // `oauth()` does not put the tokens into the SDK state (unlike `auth()`),
    // see lib/appleOAuth.ts.
    api.AuthProvider.setAccessToken(auth.accessToken);
    if (auth.refreshToken) {
      api.AuthProvider.setRefreshToken(auth.refreshToken);
      storage.set('refresh', auth.refreshToken);
    }
    // Logout is per provider — remember which one opened this session.
    storage.set(AUTH_PROVIDER_KEY, 'google');
    return {ok: true, auth};
  } catch (e) {
    return {
      ok: false,
      reason: 'exchange_failed',
      error: failure((e as Error)?.message ?? 'OAuth exchange threw'),
    };
  }
}

/** Forget the cached Google account so the next sign-in shows the chooser. */
export async function signOutOfGoogle(): Promise<void> {
  if (!isGoogleSignInConfigured()) return;
  ensureConfigured();
  await GoogleSignin.signOut().catch(() => undefined);
}
