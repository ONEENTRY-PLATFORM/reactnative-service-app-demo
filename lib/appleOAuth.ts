import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import {Platform} from 'react-native';
import {api, AUTH_PROVIDER_KEY, storage} from '@/api/defineApi';
import {IAuthEntity} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import {IError} from 'oneentry/dist/base/utils';

// Apple's client id for a native app is its bundle identifier.
const APPLE_CLIENT_ID = Constants.expoConfig?.ios?.bundleIdentifier ?? '';

export type AppleOAuthOutcome =
  | {ok: true; auth: IAuthEntity}
  | {ok: false; reason: 'unsupported' | 'cancelled' | 'no_code' | 'exchange_failed'; error?: IError};

export function isAppleSignInAvailable(): boolean {
  return Platform.OS === 'ios';
}

export async function runAppleAuth(): Promise<AppleOAuthOutcome> {
  if (!isAppleSignInAvailable()) {
    return {ok: false, reason: 'unsupported'};
  }

  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (e: any) {
    if (e?.code === 'ERR_REQUEST_CANCELED') {
      return {ok: false, reason: 'cancelled'};
    }
    return {
      ok: false,
      reason: 'exchange_failed',
      error: {
        statusCode: 500,
        message: e?.message ?? 'Apple sign-in threw',
        timestamp: new Date().toISOString(),
        pageData: null,
      },
    };
  }

  const code = credential.authorizationCode;
  if (!code) {
    return {ok: false, reason: 'no_code'};
  }

  try {
    // Attempt: send identity_token as client_secret so the OneEntry backend
    // can verify Apple's signature via /auth/keys (native-flow validation)
    // instead of trying to exchange the authorization_code via /auth/token
    // (which fails because the code is bound to the Bundle ID, not a Services ID).
    const oauthPayload = {
      client_id: APPLE_CLIENT_ID,
      client_secret: credential.identityToken ?? '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: APPLE_CLIENT_ID,
    };
    // No logging here: the credential and the response carry the user's
    // e-mail, name and session tokens.
    const authResult = await api.AuthProvider.oauth('apple', oauthPayload);

    if ((authResult as IError)?.statusCode >= 400) {
      return {
        ok: false,
        reason: 'exchange_failed',
        error: authResult as IError,
      };
    }

    const auth = authResult as IAuthEntity;

    // KEY: AuthProvider.oauth() does NOT put the tokens into the SDK state,
    // while auth() does (see authProviderApi: auth assigns state.accessToken /
    // state.refreshToken, oauth just returns the response). Without this the
    // exchange succeeds, the token is persisted, and the very next /me still
    // goes out with no Authorization header — the user stays a guest and the
    // sign-in silently does nothing. All API modules share one state module,
    // so setting it on AuthProvider covers Users.getUser too.
    if (!auth.accessToken) {
      return {
        ok: false,
        reason: 'exchange_failed',
        error: {
          statusCode: 500,
          message: 'OAuth succeeded but no access token was returned',
          timestamp: new Date().toISOString(),
          pageData: null,
        },
      };
    }
    api.AuthProvider.setAccessToken(auth.accessToken);
    if (auth.refreshToken) {
      api.AuthProvider.setRefreshToken(auth.refreshToken);
      storage.set('refresh', auth.refreshToken);
    }
    // Logout is per provider — remember which one opened this session.
    storage.set(AUTH_PROVIDER_KEY, 'apple');
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
