import {defineOneEntry} from 'oneentry';
import {createMMKV} from 'react-native-mmkv';

export const storage = createMMKV();

// Marker of the auth provider that issued the current session ('email',
// 'apple', …). The logout endpoint is per provider, so it has to be sent to
// the same marker the session was opened with.
export const AUTH_PROVIDER_KEY = 'auth-provider';

// KEY: OneEntry binds the refresh token to a device-metadata fingerprint.
// When the SDK is created without a persisted fingerprint it generates a new
// one on every cold-start, and the server rejects the previously-saved
// refresh token with "Unauthorized" / "Provided token is incorrect".
// Persisting the fingerprint alongside the refresh token is the fix — the
// pattern mirrors apps/rn-shop/src/api/api/defineApi.ts.
const DEVICE_METADATA_KEY = 'oneentry-device-metadata';
let deviceMetadata: string | undefined = storage.getString(DEVICE_METADATA_KEY);

const saveFunction = async (res: string) => {
  try {
    // Empty string means the SDK cleared the session (logout / expired) —
    // wipe MMKV so cold-start on the next launch shows the sign-in screen.
    if (!res) {
      storage.remove('refresh');
    } else {
      storage.set('refresh', res);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[Auth] saveFunction failed', e);
  }
};

const url = process.env.EXPO_PUBLIC_API_URL || '';

function buildApi(refreshToken?: string, langCode?: string) {
  return defineOneEntry(url, {
    langCode: langCode || 'en_US',
    token: process.env.EXPO_PUBLIC_API_KEY || '',
    deviceMetadata,
    auth: {
      saveFunction,
      // SDK ≥ 1.0.183: on `400 Provided token is incorrect` the SDK re-reads the
      // rotated refresh token through this and retries once. `reDefine` builds
      // new instances, so an older one can hold a token another already rotated.
      loadFunction: () => storage.getString('refresh') ?? null,
      refreshToken: refreshToken || undefined,
    },
    errors: {
      isShell: false,
    },
  });
}

export let api = buildApi(storage.getString('refresh'));

// Restore the persisted device metadata (or capture the freshly-generated
// one on the very first launch) so the fingerprint stays stable across
// cold-starts. Call this ONCE from the auth context on mount.
export async function initDeviceMetadata(): Promise<void> {
  try {
    const saved = storage.getString(DEVICE_METADATA_KEY);
    if (saved) {
      deviceMetadata = saved;
      api.AuthProvider.setDeviceMetadata(saved);
      return;
    }
    const current = api.AuthProvider.getDeviceMetadata();
    if (current) {
      deviceMetadata = current;
      storage.set(DEVICE_METADATA_KEY, current);
    }
  } catch (e) {
    console.warn('[Auth] initDeviceMetadata failed', e);
  }
}

export function reDefine(refreshToken?: string, langCode?: string) {
  api = buildApi(refreshToken, langCode);
  if (deviceMetadata) {
    api.AuthProvider.setDeviceMetadata(deviceMetadata);
  }
}
