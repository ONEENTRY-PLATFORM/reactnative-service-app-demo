import {defineOneEntry} from 'oneentry';
import {MMKV} from 'react-native-mmkv';

export const storage = new MMKV();

storage.addOnValueChangedListener((key) => {
  if (!storage.getString('refresh')) {

  }
});

const saveFunction = async (res: string) => {
  try {
    if (res) {
      storage.set('refresh', res);
    }
  } catch (e) {
    console.warn('=>(hooks.ts:20) e', e);
  }
};

const url = process.env.EXPO_PUBLIC_API_URL || '';

//Initial hooks definition
export let api = defineOneEntry(url, {
  langCode: 'en_US',
  token: process.env.EXPO_PUBLIC_API_KEY,
  auth: {
    saveFunction,
    refreshToken: storage.getString('refresh'),
  },
  errors: {
    isShell: false,
  },
});

export function reDefine(refreshToken?: string, langCode?: string) {
  api = defineOneEntry(url, {
    langCode: langCode || 'en_US',
    token: url,
    auth: {
      saveFunction,
      refreshToken,
    },
    errors: {
      isShell: false,
    },
  });
}
