import React from 'react';
import CustomButton from '@/components/shared/CustomButton';
import {useAppSelector} from '@/state/hooks';
import {router} from 'expo-router';

type Props = {};

const MasterPicker: React.FC<Props> = ({}) => {
  const {current_master_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );

  return (
    <CustomButton
      title={current_master_text}
      className={'mt-2'}
      onPress={() => router.navigate('/(tabs)/masters')}
    />
  );
};

export default MasterPicker;
