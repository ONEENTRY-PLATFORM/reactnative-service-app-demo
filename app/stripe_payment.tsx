import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Modal, View} from 'react-native';
import {Screen} from '@/components/shared/Screen';
import {
  Redirect,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import {useLazyGetPaymentSessionByIdQuery} from '@/api';
import WebView from 'react-native-webview';
import {useAppDispatch} from '@/state/hooks';
import {finishOrder} from '@/state/reducers/OrderSlice';

type Props = {};

const StripePayment: React.FC<Props> = ({}) => {
  const params = useLocalSearchParams();
  const [getPaymentStatus, {data, reset}] = useLazyGetPaymentSessionByIdQuery();
  const [bought, setBought] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const hasCompletedRef = useRef(false);
  const inFlightRef = useRef<Promise<any> | null>(null);

  const onNavigationStateChange = async (navState: {url: string}) => {
    if (hasCompletedRef.current) return;
    const {url} = navState;
    const domain = process.env.EXPO_PUBLIC_API_URL;

    if (inFlightRef.current) return; // drop extra calls
    const p = getPaymentStatus({id: Number(params.id)})
      .unwrap()
      .then(res => {
        if (hasCompletedRef.current) return;

        // @ts-ignore
        if (res?.status === 'completed') {
          console.log('completed');

          router.replace(
            `/(tabs)/confirm_booking?id=${params.orderId || '.'}&paymentId=${params.id || '.'}`,
          );
          dispatch(finishOrder());
          setBought(true);
          hasCompletedRef.current = true;
        } else {
          const onOurDomain = url.includes(domain);
          if (onOurDomain) {
            return router.replace(`/(tabs)/confirm_booking`);
          }
        }
      })
      .finally(() => {
        dispatch(finishOrder());
        inFlightRef.current = null;
      });

    inFlightRef.current = p;
  };

  useFocusEffect(
    useCallback(() => {
      if (!params.id || !params.paymentUrl) {
        router.navigate('/(tabs)/home');
      }

      return () => {
        reset();
        setBought(false);
      };
    }, [params.id, params.paymentUrl]),
  );

  if (bought) {
    return <></>;
  }

  return (
    <Screen isFull white edges={['top', 'horizontal']}>
      <Modal>
        <View className={'h-full pt-12'}>
          <WebView
            onNavigationStateChange={onNavigationStateChange}
            renderLoading={() => <ActivityIndicator />}
            source={{uri: params.paymentUrl as string}}
          />
        </View>
      </Modal>
    </Screen>
  );
};

export default StripePayment;
