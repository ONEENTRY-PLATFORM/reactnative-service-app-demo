import React, {useState} from 'react';
import {useAuth} from '@/state/contexts/AuthContext';
import CustomButton from '@/components/shared/CustomButton';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {router} from 'expo-router';
import {Alert, TouchableOpacity, View} from 'react-native';
import Select from '@/components/shared/Select';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {api} from '@/api/defineApi';
import {IOrdersFormData, IBaseOrdersEntity} from 'oneentry/dist/orders/ordersInterfaces';
import {IError} from 'oneentry/dist/base/utils';
import {ISessionEntity} from 'oneentry/dist/payments/paymentsInterfaces';
import {finishOrder} from '@/state/reducers/OrderSlice';
import dayjs from 'dayjs';

type Props = {};

const ProcessingActions: React.FC<Props> = ({}) => {
  const {user} = useAuth();
  const {
    method: selectedMethod,
    service,
    salon,
    master,
    date,
    time,
  } = useAppSelector(state => state.OrderReducer);

  const [isLoading, setIsLoading] = useState(false);
  const {sign_in_text, apply_text, terms_agreement} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const dispatch = useAppDispatch();
  const [agreed, setAgreed] = useState<boolean>(true);
  const toggleSwitch = () => setAgreed(!agreed);

  const createPaymentSession = async (id: number) => {
    const session = await api.Payments.createSession(id, 'session');

    if ((session as IError)?.statusCode >= 400) {
      throw new Error((session as IError).message);
    }

    const {paymentUrl, id: sessionId} = session as ISessionEntity;

    if (paymentUrl) {
      router.push({
        pathname: '/stripe_payment',
        params: {
          paymentUrl,
          id: sessionId,
          orderId: id,
        },
      });
    }
  };

  const subscribeToEvent = async (id: number) => {
    try {
      const result = await api.Events.subscribeByMarker('order_change', id);

      if ((result as IError).statusCode > 400) {
        throw new Error((result as IError).message);
      }
    } catch (e) {
      console.warn(JSON.stringify(e));
    }
  };

  const onSubmitOrder = async () => {
    setIsLoading(true);
    try {
      // transform the form data to the required format
      if (selectedMethod && service && salon && master) {
        const editedFormData: IOrdersFormData[] = [
          {
            marker: 'order_salon',
            type: 'entity',
            value: [salon.id],
          },
          {
            marker: 'master',
            type: 'list',
            value: [master.id.toString()],
          },
          {
            marker: 'interval',
            type: 'timeInterval',
            value: [
              [
                dayjs(date).set('hour', time).toISOString(),
                dayjs(date).set('hour', time + 1).toISOString(),
              ],
            ],
          },
        ];

        const result = await api.Orders.createOrder('orders', {
          formData: editedFormData,
          formIdentifier: 'order',
          paymentAccountIdentifier: selectedMethod,
          products: [
            {
              productId: service.id,
              quantity: 1,
            },
          ],
        });

        if ((result as IError)?.statusCode >= 400) {
          throw new Error((result as IError).message);
        }

        const order = result as IBaseOrdersEntity;

        await subscribeToEvent(order.id);
        if (order.paymentAccountIdentifier !== 'cash') {
          await createPaymentSession(order.id);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          dispatch(finishOrder());
          return router.replace(`/(tabs)/confirm_booking?id=${order.id}`);
        }
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert(e.message);
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <View className={'flex-1 items-end gap-y-2.5'}>
        <CustomButton
          onPress={() => router.navigate('/auth')}
          title={sign_in_text}
        />
      </View>
    );
  }

  return (
    <View className={'flex-1 items-end gap-y-4'}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleSwitch}
        className={'flex-row items-center justify-start w-full'}>
        <Select isRound={false} color={appColors.primary} selected={agreed} />
        <Paragraph size={14} weight={'500'} color={'dark'} className={'ml-2.5'}>
          {terms_agreement}
        </Paragraph>
      </TouchableOpacity>
      <CustomButton
        isLoading={isLoading}
        disabled={!agreed || !selectedMethod}
        title={apply_text}
        onPress={onSubmitOrder}
      />
    </View>
  );
};

export default ProcessingActions;
