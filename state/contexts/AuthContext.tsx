import {IUserEntity} from 'oneentry/dist/users/usersInterfaces';
import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {reDefine, useLazyGetMeQuery} from '@/api';
import {api, storage} from '@/api/defineApi';
import {IAuthPostBody} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import {IError} from 'oneentry/dist/base/utils';
import {Alert} from 'react-native';
import {useNotifications} from '@/lib/notifications';

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
  }) => void;
  authenticate: () => void;
  logOut: () => void;
};

export const AuthContext = createContext<ContextProps>({
  isLoading: false,
  authenticate: () => {},
  signIn: () => {},
  logOut: () => {},
});

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({children}: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTokenSet, setIsTokenSet] = useState<boolean>(false);
  const [getUser, {data: user, error, reset}] = useLazyGetMeQuery({
    pollingInterval: 10000,
  });
  const {token} = useNotifications();
  const refresh = storage.getString('refresh');

  //methods
  const signIn = async ({
    method,
    login,
    password,
  }: {
    method: string;
    login: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      const preparedData: IAuthPostBody = {
        authData: [
          {
            marker: 'email_reg',
            value: login,
          },
          {
            marker: 'password_reg',
            value: password,
          },
        ],
      };

      const res = await api.AuthProvider.auth(method, preparedData);

      if (!res || (res as IError)?.statusCode >= 400) {
        throw new Error((res as IError).message);
      }

      if (res?.accessToken) {
        await getUser({});
      } else {
        throw new Error('no token');
      }
    } catch (e: any) {
      Alert.alert(e?.message?.toString());
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

    storage.delete('refresh');
    reset();
    setIsLoading(false);
  };

  //refresh session
  useEffect(() => {
    if (refresh) getUser({});
  }, []);

  const updatePushToken = async () => {
    try {
      console.log('updated token');
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
        .then()
        .catch(e => console.warn(e));
    }
  }, [user, token, isTokenSet]);

  useEffect(() => {
    if (error) {
      console.log(error);
      logOut();
    }
  }, [error]);

  const value = {
    authenticate,
    signIn,
    logOut,
    user,
    isLoading,
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
