import React, {memo} from 'react';
import CustomButton from '@/components/shared/CustomButton';
import {router} from 'expo-router';
import {useAppSelector} from '@/state/hooks';

type Props = {};

const ServiceSelectButton: React.FC<Props> = ({}) => {
  const {select_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const service = useAppSelector(state => state.OrderReducer.service);

  return (
    <CustomButton
      onPress={() => router.navigate('/(tabs)/masters')}
      style={{marginTop: 30, marginBottom: 15}}
      isInline
      color={'primary'}
      title={select_text}
      disabled={!service}
    />
  );
};

export default memo(ServiceSelectButton);
