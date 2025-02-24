import React from 'react';
import CustomButton from '@/components/shared/CustomButton';
import {useAppSelector} from '@/state/hooks';
import {router} from 'expo-router';

type Props = {};

const SelectMastersButton: React.FC<Props> = ({}) => {
  const {select_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const master = useAppSelector(state => state.OrderReducer.master);

  return (
    <CustomButton
      onPress={() => router.navigate('/(tabs)/booking')}
      style={{alignSelf: 'center'}}
      type={'sm'}
      title={select_text}
      disabled={!master}
      isInline
    />
  );
};

export default SelectMastersButton;
