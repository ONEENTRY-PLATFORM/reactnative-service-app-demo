import React, {memo} from 'react';
import CustomButton from '@/components/shared/CustomButton';
import {View} from 'react-native';
import {router} from 'expo-router';

type Props = {};

const ConfirmOrderButton: React.FC<Props> = ({}) => {
  return (
    <View className={'w-full flex-1 items-end justify-center'}>
      <CustomButton
        title={'Confirm'}
        onPress={() => router.navigate('/(tabs)/order_processing')}
      />
    </View>
  );
};

export default memo(ConfirmOrderButton);
