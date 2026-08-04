import {RTKApi} from '@/api/methods/RTKApi';
import {AuthRTKApi} from '@/api/methods/AuthRTKApi';

export {reDefine} from './defineApi';
export {RTKApi};

// AuthRTKApi is RTKApi.injectEndpoints(...) — same store, base endpoints included.
export const {
  useGetMenuQuery,
  useGetChildPagesByUrlQuery,
  useLazyGetChildPagesByUrlQuery,
  useGetBlocksByPageUrlQuery,
  useGetProductsByPageUrlQuery,
  useGetAuthProvidersQuery,
  useLazyGetProductsByPageUrlQuery,
  useGetMastersQuery,
  useGetBlockByMarkerQuery,
  useGetFormByMarkerQuery,
  useGetProductsByIdsQuery,
  useLazyGetProductsByIdsQuery,
  useLazyGetMeQuery,
  useGetAccountsQuery,
  useLazyGetPaymentSessionByIdQuery,
  useGetUserOrdersQuery,
  useGetPagesByIdsQuery,
  useLazyGetPagesByIdsQuery,
  useGetPagesByUrlsQuery,
  useResetPasswordMutation,
  useUpdateMeMutation,
  useSignUpMutation,
  useGenerateOTPMutation,
  useActivateMeMutation,
  useLazyGetOrderByIDQuery,
  useGetAttributesByMarkerQuery,
  // stage 2: parity with nextjs-beauty
  useGetSlidesQuery,
  useSearchProductsQuery,
  useLazySearchProductsQuery,
  useGetRelatedProductsByIdQuery,
  useLazyGetRelatedProductsByIdQuery,
  usePostFormsDataMutation,
  useCreateRefundRequestMutation,
  useGetSessionByOrderIdQuery,
  useLazyGetSessionByOrderIdQuery,
} = AuthRTKApi;
