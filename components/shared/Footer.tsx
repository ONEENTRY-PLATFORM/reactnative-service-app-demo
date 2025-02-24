import React from 'react';
import {View, ViewProps} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {
  height?: number;
} & ViewProps;

const Footer: React.FC<Props> = ({height = 50, ...rest}) => {
  const {style} = rest;
  const {bottom} = useSafeAreaInsets();
  return (
    <View
      style={[{height: (bottom + 50 + height)}, style]}
      {...rest}
    />
  );
};

export default Footer;
