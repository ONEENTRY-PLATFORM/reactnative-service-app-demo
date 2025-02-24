import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from 'react-native';
import {Paragraph, ParagraphProps} from '@/components/shared/Paragraph';

type Props = {
  title?: string;
  paragraphProps?: ParagraphProps;
  onPress: () => void;
  children: React.ReactNode;
  outline?: boolean;
  outlineColor?: string;
  touchableOpacityProps?: TouchableOpacityProps;
} & ViewProps;

const CardBase: React.FC<Props> = ({
  title,
  paragraphProps,
  onPress,
  children,
  outline,
  outlineColor,
  touchableOpacityProps,
  ...rest
}) => {
  return (
    <TouchableOpacity
      style={{
        borderColor: outlineColor ?? '#ffffff',
        borderWidth: outline ? 1 : 0,
        borderRadius: outline ? 20 : 0
      }}
      onPress={onPress}
      activeOpacity={0.7}
      {...touchableOpacityProps}>
      {title && (
        <Paragraph size={16} color={'dark'} {...paragraphProps}>
          {title}
        </Paragraph>
      )}
      <View className={'rounded-lg'} {...rest}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

export default CardBase;
