import React from 'react';
import {Screen} from '@/components/shared/Screen';
import {useLocalSearchParams} from 'expo-router';
import BookingFailed from '@/components/content/ConfirmBooking/BookingFailed';
import BookingSucceed from '@/components/content/ConfirmBooking/BookingSucceed';

type Props = {};

const ConfirmBooking: React.FC<Props> = ({}) => {
  const params = useLocalSearchParams();

  console.log('params' + params);

  return (
    <Screen edges={['top', 'horizontal']}>
      {params?.id ? <BookingSucceed /> : <BookingFailed />}
    </Screen>
  );
};

export default ConfirmBooking;
