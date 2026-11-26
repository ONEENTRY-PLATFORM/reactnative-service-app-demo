import React from 'react';
import CustomButton from '@/components/shared/CustomButton';
import {
  IOrderByMarkerEntity,
  IOrderData,
} from 'oneentry/dist/orders/ordersInterfaces';
import {api} from '@/api/defineApi';
import {IError} from 'oneentry/dist/base/utils';
import Toast from 'react-native-toast-message';
import {useAppSelector} from '@/state/hooks';

type Props = {
  orderData?: IOrderByMarkerEntity;
  refetch: () => void;
};

const CancelOrderButton: React.FC<Props> = ({orderData, refetch}) => {
  const {cancel_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );


  const onCancel = async () => {
    if (!orderData) return;

    // `statusIdentifier` is accepted by the endpoint but not declared on
    // IOrderData — see useBookingSubmit.
    const formatedOrderData: IOrderData & {statusIdentifier: string} = {
      formIdentifier: orderData.formIdentifier ?? '',
      paymentAccountIdentifier: orderData.paymentAccountIdentifier ?? '',
      formData: orderData.formData,
      products: orderData.products.map(product => ({
        productId: product.id,
        quantity: product.quantity,
      })),
      statusIdentifier: 'canceled',
    };

    try {
      const result = await api.Orders.updateOrderByMarkerAndId(
        'orders',
        orderData.id,
        formatedOrderData,
      );

      console.log(result);

      if ((result as IError)?.statusCode >= 400) {
        throw new Error((result as IError).message);
      }

      refetch();
      Toast.show({
        type: 'success',
        text1: 'Order canceled!',
      });
    } catch (e) {
      console.log(e);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: e?.message?.toString(),
      });
    }
  };

  return (
    <CustomButton
      type={'sm'}
      isInline
      title={cancel_text}
      color={'blue'}
      onPress={onCancel}
    />
  );
};

export default CancelOrderButton;
