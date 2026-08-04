import React, {memo} from 'react';
import CustomButton from '@/components/shared/CustomButton';
import {View} from 'react-native';
import {router} from 'expo-router';
import {useAppSelector} from '@/state/hooks';

type Props = object;

const ConfirmOrderButton: React.FC<Props> = () => {
  const {date, time} = useAppSelector(state => state.OrderReducer);
  const {select_date_text, select_time_text, select_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );

  return (
    <View
      className={
        'w-screen px-layout absolute bottom-28 items-end justify-center'
      }>
      <CustomButton
        title={
          !date ? select_date_text : !time ? select_time_text : select_text
        }
        disabled={!time}
        onPress={() => router.navigate('/(tabs)/order_processing')}
      />
    </View>
  );
};

export default memo(ConfirmOrderButton);
