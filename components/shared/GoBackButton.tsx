import React from 'react';
import {TouchableOpacity} from 'react-native';
import Arrow from '@/assets/icons/Arrow.svg';
import {router} from 'expo-router';

type Props = {
  onPressCustom?: () => void;
  style?: 'default' | 'gray';
};

const GoBackButton: React.FC<Props> = ({onPressCustom, style = 'default'}) => {
  const onPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home_mobile');
    }
  };

  return (
    <TouchableOpacity
      onPress={onPressCustom || onPress}
      className={
        style === 'default'
          ? 'rounded-full p-2 border-sm border-white z-50'
          : 'rounded-full p-2 bg-lightGray z-50'
      }
      activeOpacity={0.7}>
      <Arrow fill={style === 'default' ? '#fff' : '#000'} />
    </TouchableOpacity>
  );
};

export default GoBackButton;
