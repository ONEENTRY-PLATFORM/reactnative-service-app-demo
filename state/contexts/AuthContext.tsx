import {IUserEntity} from 'oneentry/dist/users/usersInterfaces';
import {createContext, ReactNode, useContext, useEffect, useRef, useState} from 'react';
import {useLazyGetMeQuery} from '@/api';
import {api, initDeviceMetadata, storage} from '@/api/defineApi';
import {IAuthEntity, IAuthPostBody} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import {IError} from 'oneentry/dist/base/utils';
import {useNotifications} from '@/lib/notifications';

export type SignInResult =
  | {ok: true}
  | {ok: false; error: string; userMissing: boolean};

type ContextProps = {
  isLoading?: boolean;
  user?: IUserEntity;
  signIn: ({
    method,
    login,
    password,
  }: {
    method: string;
    login: string;
    password: string;
  }) => Promise<SignInResult>;
  authenticate: () => void;
  logOut: () => void;
  isUserInit?: boolean;
};

export const AuthContext = createContext<ContextProps>({
  isLoading: false,
  authenticate: () => {},
  signIn: async () => ({ok: false, error: 'not initialised', userMissing: false}),
  logOut: () => {},
});

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({children}: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTokenSet, setIsTokenSet] = useState<boolean>(false);
  const [user, setUser] = useState<IUserEntity>();
  const [getUser, {data, error, reset}] = useLazyGetMeQuery();
  const [isUserInit, setIsUserInit] = useState<boolean>(false);
  // Guard against StrictMode/HMR firing the cold-start effect twice — the
  // OneEntry refresh token is SINGLE-USE, so a second run consumed the
  // freshly-rotated token and made the server reject it. The ref survives
  // both invocations because refs live outside the effect scope.
  const coldStartFiredRef = useRef(false);
  
  const {token} = useNotifications();
  const refresh = storage.getString('refresh');

  useEffect(() => {
    const refresh = storage.getString('refresh');
    if (user || error || !refresh) {
      setIsUserInit(true);
    }
  }, [user, error]);

  useEffect(() => {
    // Only mirror server data into local state — DO NOT reset `user` on
    // `data === undefined`. RTK returns `undefined` briefly on refetch, and
    // clearing user during that window bumped the profile page into the
    // sign-in redirect even for a valid session.
    if (!data) return;
    if (JSON.stringify(user) !== JSON.stringify(data)) {
      setUser(data);
    }
  }, [data]);

  //methods
  const signIn = async ({
    method,
    login,
    password,
  }: {
    method: string;
    login: string;
    password: string;
  }): Promise<SignInResult> => {
    setIsLoading(true);
    try {
      const preparedData: IAuthPostBody = {
        authData: [
          {marker: 'email_reg', value: login},
          {marker: 'password_reg', value: password},
        ],
      };
      const res = (await api.AuthProvider.auth(method, preparedData)) as
        | IAuthEntity
        | IError;

      // Translate CMS/SDK errors into English + surface whether the user is
      // missing so the sign-in screen can suggest registration.
      if (!res || (res as IError).statusCode >= 400) {
        const raw = String((res as IError)?.message ?? '').toLowerCase();
        const userMissing =
          raw.includes('not found') ||
          raw.includes("doesn't exist") ||
          raw.includes('does not exist') ||
          raw.includes('no user') ||
          raw.includes('user not') ||
          raw.includes('not registered') ||
          raw.includes('unknown user');
        const wrongPassword =
          raw.includes('password') || raw.includes('credential');
        const error = userMissing
          ? "We couldn't find an account with this e-mail."
          : wrongPassword
            ? 'Wrong e-mail or password.'
            : (res as IError)?.message || 'Sign-in failed. Please try again.';
        return {ok: false, error, userMissing};
      }

      if ((res as IAuthEntity).accessToken) {
        // Persist the refresh token — SDK's saveFunction fires on auth()
        // too, so this is technically redundant, but keeping it explicit is
        // cheap insurance and mirrors the previous behavior.
        const refreshToken = (res as IAuthEntity).refreshToken;
        if (refreshToken) storage.set('refresh', refreshToken);
        await getUser({});
        return {ok: true};
      }
      return {
        ok: false,
        error: 'Sign-in failed: no access token returned.',
        userMissing: false,
      };
    } catch (e: any) {
      return {
        ok: false,
        error: e?.message?.toString() || 'Something went wrong. Try again.',
        userMissing: false,
      };
    } finally {
      // Reset loading in both success and failure branches — the previous
      // implementation left it stuck at true on the success path, so the
      // "Sign in" button stayed grey after a successful login.
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    await getUser({});
    setIsLoading(false);
  };

  const logOut = async () => {
    try {
      const result = await api.AuthProvider.logout('email', refresh || '');
      if ((result as IError)?.statusCode >= 400) {
        throw new Error((result as IError)?.message);
      }
    } catch (e) {
      console.log('=>(AuthContext.tsx:107) e', e);
    }

    storage.remove('refresh');
    reset();
    setIsLoading(false);
  };

  //refresh session — on cold start, if a refresh token is in MMKV, use it
  //to obtain a fresh access token BEFORE hitting /me. Without the explicit
  //refresh() step the SDK sometimes fires /me with no accessToken cached in
  //memory, gets a 401 and the aggressive error effect used to log the user
  //out. Running the round-trip here also lets us persist the rotated refresh
  //token that OneEntry returns.
  useEffect(() => {
    // Only ever run this once per process — StrictMode/HMR would otherwise
    // fire it twice and burn the single-use refresh token on the second run.
    if (coldStartFiredRef.current) return;
    coldStartFiredRef.current = true;

    const stored = storage.getString('refresh');
    if (!stored) {
      setIsUserInit(true);
      return;
    }
    (async () => {
      // FIRST — restore the persisted device-metadata fingerprint. OneEntry
      // binds refresh tokens to this fingerprint; without restoring it the
      // SDK regenerates a new one on every cold-start and the server rejects
      // the stored refresh with "Unauthorized" / "Provided token is
      // incorrect". Mirrors rn-shop's pattern.
      await initDeviceMetadata();

      // The SDK's `browserResponse` does PROACTIVE refresh: when
      // `state.accessToken` is empty but `state.refreshToken` is set
      // (exactly the cold-start situation) any authenticated request first
      // calls `refreshToken()` to exchange the stored refresh for a fresh
      // access token, updates state and fires `saveFunction`. So we must
      // NOT call `AuthProvider.refresh()` ourselves — it would consume the
      // single-use token, then the SDK's proactive refresh would try to use
      // the same (now-invalid) token and fail. Just call /me.
      try {
        const me: any = await api.Users.getUser();
        if (me && me.statusCode >= 400) {
          if (me.statusCode === 401 || me.statusCode === 403) {
            storage.remove('refresh');
            reset();
          }
          setIsUserInit(true);
          return;
        }
        setUser(me as IUserEntity);
        setIsUserInit(true);
      } catch {
        // Network hiccup — keep the token, just mark init complete so the
        // profile screen doesn't spin forever. Next launch retries.
        setIsUserInit(true);
      }
    })();
  }, []);

  const updatePushToken = async () => {
    try {
      const res = await api.Users.addFCMToken(token);

      if ((res as IError)?.statusCode > 400) {
        throw new Error((res as IError)?.message);
      }
      setIsTokenSet(true);
    } catch (e) {
      console.log('=>(AuthContext.tsx:95) e', e);
    }
  };

  useEffect(() => {
    if (user && token && !isTokenSet) {

      updatePushToken()
        .then(res => console.log(res))
        .catch(e => console.warn(e));
    }
  }, [user, token, isTokenSet]);

  useEffect(() => {
    // Only sign the user out when the CMS explicitly rejects the token
    // (401 / 403). Any other failure — network hiccup, 5xx, transient DNS —
    // must NOT wipe the refresh token, otherwise a bad Wi-Fi kick would
    // silently log the user out and force a full sign-in on next launch.
    if (!error) return;
    const status = (error as any)?.status ?? (error as any)?.statusCode;
    const msg = String((error as any)?.message ?? '').toLowerCase();
    const looksLikeAuthReject =
      status === 401 ||
      status === 403 ||
      msg.includes('unauthorized') ||
      msg.includes('invalid token') ||
      msg.includes('token expired');
    if (looksLikeAuthReject) {
      logOut().then(() => console.log('log out ' + error));
    }
  }, [error]);

  const value = {
    authenticate,
    signIn,
    logOut,
    user,
    isLoading,
    isUserInit,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
