import React from 'react';
import {View} from 'react-native';
import {StyleProps} from 'react-native-reanimated';

interface Props {
  selected: boolean;
  color: string;
  isRound?: boolean;
}

const Select: React.FC<Props> = ({selected, color, isRound = true}) => {
  const colorStyles: StyleProps = {
    backgroundColor: selected ? color : 'white',
    borderColor: color,
  };
  return (
    <View className={isRound ? `border-sm h-4 w-4 rounded-full` : 'border-sm h-4 w-4 rounded-[3px]'} style={[colorStyles]} />
  );
};

export default Select;
