import {createApi, fakeBaseQuery} from '@reduxjs/toolkit/query/react';
import {api} from '@/api/defineApi';
import {IMenusEntity} from 'oneentry/dist/menus/menusInterfaces';
import {IAttributes, IError} from 'oneentry/dist/base/utils';
import {
  IPagesEntity,
  IPositionBlock,
} from 'oneentry/dist/pages/pagesInterfaces';
import {
  IFilterParams,
  IProductEntity,
  IProductsEntity,
  IProductsResponse,
} from 'oneentry/dist/products/productsInterfaces';
import {IAdminEntity} from 'oneentry/dist/admins/adminsInterfaces';
import {addMasters} from '@/state/reducers/MastersSlice';
import {IBlockEntity} from 'oneentry/dist/blocks/blocksInterfaces';
import {
  IAuthFormData,
  IAuthProvidersEntity,
} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import {IUserEntity} from 'oneentry/dist/users/usersInterfaces';
import {IFormsEntity} from 'oneentry/dist/forms/formsInterfaces';
import {
  IAccountsEntity,
  ISessionEntity,
} from 'oneentry/dist/payments/paymentsInterfaces';
import {IOrdersByMarkerEntity} from 'oneentry/dist/orders/ordersInterfaces';

export const RTKApi = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  endpoints: builder => ({
    getMenu: builder.query<IMenusEntity, {marker: string}>({
      queryFn: async ({marker}) => {
        try {
          const result = await api.Menus.getMenusByMarker(marker);

          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }

          return {data: result as IMenusEntity};
        } catch (e: any) {
          console.warn('=>(RTKApi.ts:28) e', e);
          return {error: e.message};
        }
      },
    }),

    getChildPagesByUrl: builder.query<IPagesEntity[], {url: string}>({
      queryFn: async ({url}) => {
        try {
          const result = await api.Pages.getChildPagesByParentUrl(url);

          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }

          return {data: result as IPagesEntity[]};
        } catch (e: any) {
          console.warn('=>(RTKApi.ts:47) e', e);
          return {error: e.message};
        }
      },
    }),

    getBlocksByPageUrl: builder.query<IPositionBlock[], {pageUrl?: string}>({
      queryFn: async ({pageUrl}) => {
        try {
          if (!pageUrl) {
            return {data: []};
          }

          const result = await api.Pages.getBlocksByPageUrl(pageUrl);

          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }

          return {data: result as IPositionBlock[]};
        } catch (e: any) {
          return {error: e.message};
        }
      },
    }),

    getProductsByPageUrl: builder.query<
      IProductEntity[],
      {pageUrl: string; filters?: IFilterParams[]}
    >({
      queryFn: async ({pageUrl, filters}) => {
        try {
          const result = await api.Products.getProductsByPageUrl(
            pageUrl,
            filters,
          );

          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }

          return {data: (result as IProductsResponse).items};
        } catch (e) {
          return {error: e};
        }
      },
    }),

    getMasters: builder.query<IAdminEntity[], {}>({
      queryFn: async ({}) => {
        try {
          const result = await api.Admins.getAdminsInfo();

          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }

          return {data: result as IAdminEntity[]};
        } catch (e) {
          return {error: e};
        }
      },
      async onQueryStarted(_, {dispatch, queryFulfilled}) {
        try {
          const {data} = await queryFulfilled;
          // Dispatch your slice's action with the fetched data
          dispatch(addMasters(data));
        } catch (err) {
          console.error('Failed to fetch masters:', err);
        }
      },
    }),

    getBlockByMarker: builder.query<
      IBlockEntity,
      {marker: string; offset?: number; limit?: number; langCode?: string}
    >({
      queryFn: async ({marker, offset, limit, langCode}) => {
        try {
          const result = await api.Blocks.getBlockByMarker(
            marker,
            langCode,
            offset,
            limit,
          );

          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }
          return {data: result as IBlockEntity};
        } catch (e: any) {
          return {error: e.message};
        }
      },
    }),

    getAuthProviders: builder.query<IAuthProvidersEntity[], {}>({
      queryFn: async ({}) => {
        try {
          const result = await api.AuthProvider.getAuthProviders();
          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }
          return {data: (result as IAuthProvidersEntity[]) || []};
        } catch (e: any) {
          return {error: e.message};
        }
      },
    }),

    getMe: builder.query<IUserEntity, {}>({
      queryFn: async () => {
        try {
          const result = await api.Users.getUser();
          if (!result || (result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }
          return {data: result as IUserEntity};
        } catch (e: any) {
          return {error: e};
        }
      },
    }),

    updateMe: builder.mutation<
      boolean,
      {formIdentifier: string; formData: IAuthFormData[]}
    >({
      queryFn: async ({formData, formIdentifier}) => {
        try {
          const result = await api.Users.updateUser({
            formIdentifier,
            formData,
          });
          if (!result || (result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }
          if (!result) throw new Error('Cant update user');
          return {data: result as boolean};
        } catch (e: any) {
          return {error: e};
        }
      },
    }),

    setFCMToken: builder.mutation<boolean, {token: string}>({
      queryFn: async ({token}) => {
        try {
          const res = await api.Users.addFCMToken(token);
          if ((res as IError)?.statusCode > 400) {
            throw new Error((res as IError)?.message);
          }

          return {data: res as boolean};
        } catch (e) {
          return {error: e};
        }
      },
    }),

    getFormByMarker: builder.query<IFormsEntity, {marker: string}>({
      queryFn: async ({marker}) => {
        try {
          const result = await api.Forms.getFormByMarker(marker);

          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }

          result.attributes.sort(
            (a: IAttributes, b: IAttributes) => a.position - b.position,
          );
          return {data: result as IFormsEntity};
        } catch (e: any) {
          return {error: e.message};
        }
      },
    }),

    getProductsByIds: builder.query<IProductsEntity[], {ids: number[]}>({
      queryFn: async ({ids}) => {
        try {
          let result = await Promise.all(
            ids.map(id => {
              return api.Products.getProductById(id);
            }),
          );

          if (result[0] === undefined) {
            throw new Error('No products found');
          }

          if ((result[0] as IError)?.statusCode >= 400) {
            throw new Error((result[0] as IError)?.message);
          }

          return {data: result as IProductsEntity[]};
        } catch (e: any) {
          return {error: e.message};
        }
      },
    }),

    getPagesByIds: builder.query<IPagesEntity[], {ids: number[]}>({
      queryFn: async ({ids}) => {
        try {
          let result = await Promise.all(
            ids.map(id => {
              return api.Pages.getPageById(id);
            }),
          );

          if (result[0] === undefined) {
            throw new Error('No products found');
          }

          if ((result[0] as IError)?.statusCode >= 400) {
            throw new Error((result[0] as IError)?.message);
          }

          return {data: result as IPagesEntity[]};
        } catch (e: any) {
          return {error: e.message};
        }
      },
    }),

    getPagesByUrls: builder.query<IPagesEntity[], {urls: string[]}>({
      queryFn: async ({urls}) => {
        try {
          let result = await Promise.all(
            urls.map(url => {
              return api.Pages.getPageByUrl(url);
            }),
          );
          console.log(result);

          if (result[0] === undefined) {
            throw new Error('No products found');
          }

          if ((result[0] as IError)?.statusCode >= 400) {
            throw new Error((result[0] as IError)?.message);
          }

          return {data: result as IPagesEntity[]};
        } catch (e: any) {
          return {error: e.message};
        }
      },
    }),

    getAccounts: builder.query<IAccountsEntity[], {}>({
      queryFn: async () => {
        try {
          const result = await api.Payments.getAccounts();

          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }

          return {data: result as IAccountsEntity[]};
        } catch (e: any) {
          return {error: e.message};
        }
      },
    }),

    getPaymentSessionById: builder.query<
      ISessionEntity,
      {id?: number | string}
    >({
      queryFn: async ({id}) => {
        try {
          // @ts-ignore
          const result = await api.Payments.getSessionById(id);
          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }
          return {data: (result as ISessionEntity)};
        } catch (e: any) {
          return {error: e.message};
        }
      },
    }),

    getUserOrders: builder.query<IOrdersByMarkerEntity, {marker: string}>({
      queryFn: async ({marker}) => {
        try {
          const result = await api.Orders.getAllOrdersByMarker(marker);

          if ((result as IError)?.statusCode >= 400) {
            throw new Error((result as IError)?.message);
          }

          return {data: result as IOrdersByMarkerEntity};
        } catch (e: any) {
          return {error: e.message};
        }
      },
    }),
  }),
});
