import React, {memo} from 'react';
import {View} from 'react-native';

type Props = {
  height?: number;
  width?: number;
};

const FlexLoader: React.FC<Props> = ({height, width}) => {
  return (
    <View
      style={[width ? {width} : {}, height ? {height} : {}]}
      className={`animate-pulse rounded-lg bg-lightGray flex-1`} />
  );
};

export default memo(FlexLoader);
