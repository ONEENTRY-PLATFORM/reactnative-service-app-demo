import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Modal, View} from 'react-native';
import {Screen} from '@/components/shared/Screen';
import {router, useFocusEffect, useLocalSearchParams} from 'expo-router';
import {useLazyGetPaymentSessionByIdQuery} from '@/api';
import WebView from 'react-native-webview';
import {useAppDispatch} from '@/state/hooks';
import {finishOrder} from '@/state/reducers/OrderSlice';

type Props = {};

const StripePayment: React.FC<Props> = ({}) => {
  const params = useLocalSearchParams();
  const [getPaymentStatus] = useLazyGetPaymentSessionByIdQuery();
  const [bought, setBought] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const onNavigationStateChange = async (navState: {
    url: string;
    title: string;
    canGoBack: boolean;
  }) => {
    try {
      const {url} = navState;
      const res = await getPaymentStatus(
        {id: parseInt(params.id as string)},
        false,
      );
      if (res?.data) {
        // @ts-ignore
        if (res?.data?.status === 'completed') {
          setBought(true);
          dispatch(finishOrder());
        }

        if (!url.includes('stripe')) {
        }
      }
    } catch (e) {
      console.log('=>(stripe_payment.tsx:36) e', e);
    }
  };

  useEffect(() => {
    if (bought) {
      router.replace('/(tabs)/confirm_booking?id=1');
    }
  }, [bought]);

  useFocusEffect(() => {
    if (!params.id || !params.paymentUrl) {
      router.navigate('/(tabs)/home_mobile');
    }
  });

  if (bought) {
    return <></>;
  }

  return (
    <Screen isFull white edges={['top', 'horizontal']}>
      <Modal>
        <View className={'h-full pt-12'}>
          <WebView
            cacheEnabled={false}
            startInLoadingState={true}
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
