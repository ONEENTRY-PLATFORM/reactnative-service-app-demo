import React, {memo} from 'react';
import CustomButton from '@/components/shared/CustomButton';
import {router} from 'expo-router';
import {useAppSelector} from '@/state/hooks';

type Props = {};

const ServiceSelectButton: React.FC<Props> = ({}) => {
  const {select_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const {service, master} = useAppSelector(state => state.OrderReducer);

  const onPress = () => {
    if (master) {
      return router.navigate('/(tabs)/booking');
    }

    if (service) {
      return router.navigate('/(tabs)/masters');
    }
  };

  return (
    <CustomButton
      onPress={onPress}
      style={{marginBottom: 15}}
      isInline
      color={'primary'}
      title={select_text}
      disabled={!service}
    />
  );
};

export default memo(ServiceSelectButton);
