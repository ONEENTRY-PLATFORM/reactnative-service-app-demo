import {RTKApi} from '@/api/methods/RTKApi';
import {AuthRTKApi} from '@/api/methods/AuthRTKApi';

export {reDefine} from './defineApi';
export {RTKApi};

export const {
  useGetMenuQuery,
  useGetChildPagesByUrlQuery,
  useGetBlocksByPageUrlQuery,
  useGetProductsByPageUrlQuery,
  useGetAuthProvidersQuery,
  useLazyGetProductsByPageUrlQuery,
  useGetMastersQuery,
  useGetBlockByMarkerQuery,
  useGetFormByMarkerQuery,
  useLazyGetProductsByIdsQuery,
  useLazyGetMeQuery,
  useGetAccountsQuery,
  useLazyGetPaymentSessionByIdQuery,
  useGetUserOrdersQuery,
  useGetPagesByIdsQuery,
  useGetPagesByUrlsQuery,

  useUpdateMeMutation,
  useSignUpMutation,
  useGenerateOTPMutation,
  useActivateMeMutation,
} = RTKApi && AuthRTKApi;
