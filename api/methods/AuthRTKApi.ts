import {api} from '@/api/defineApi';
import {
  ISignUpData,
  ISignUpEntity,
} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import {IError} from 'oneentry/dist/base/utils';
import {RTKApi} from './RTKApi';

export const AuthRTKApi = RTKApi.injectEndpoints({
  endpoints: builder => ({
    signUp: builder.mutation<ISignUpEntity, {data: ISignUpData}>({
      queryFn: async ({data}) => {
        try {
          const result = await api.AuthProvider.signUp('email', data, 'en_US');

          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }

          return {data: result as ISignUpEntity};
        } catch (e: any) {
          return {error: e};
        }
      },
    }),

    generateOTP: builder.mutation<
      boolean,
      {marker: string; identifier: string; event: string}
    >({
      queryFn: async ({marker, event, identifier}) => {
        try {
          const result = await api.AuthProvider.generateCode(
            marker,
            identifier,
            event,
          );

          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }

          return {data: true};
        } catch (e: any) {
          console.warn('e', e);
          return {error: e.message};
        }
      },
    }),

    activateMe: builder.mutation<
      boolean,
      {marker: string; identifier: string; code: string}
    >({
      queryFn: async ({marker, code, identifier}) => {
        try {
          const result = await api.AuthProvider.activateUser(
            marker,
            identifier,
            code,
          );

          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }

          return {data: true};
        } catch (e: any) {
          console.warn('=>(RTKApi.ts:28) e', e);
          return {error: e.message};
        }
      },
    }),

    resetPassword: builder.mutation<
      boolean,
      {
        marker: string;
        identifier: string;
        code: string;
        password: string;
        eventIdentifier?: string;
        type?: number;
      }
    >({
      queryFn: async ({
        marker,
        code,
        identifier,
        password,
        eventIdentifier = 'reset_password',
        type = 2,
      }) => {
        try {
          const result = await api.AuthProvider.changePassword(
            marker,
            identifier,
            eventIdentifier,
            type,
            code,
            password,
            password,
          );

          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }

          return {data: true};
        } catch (e: any) {
          console.warn('=>(RTKApi.ts:96) e', e);
          return {error: e.message};
        }
      },
    }),
  }),
  overrideExisting: false,
});
