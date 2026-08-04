import React from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import {Paragraph, ParagraphProps} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';

type Props = TouchableOpacityProps & {
  title?: string;
  children?: string;
  color?: keyof typeof appColors;
  paragraphColor?: keyof typeof appColors;
  type?: 'sm' | 'lg';
  isInline?: boolean;
  isLoading?: boolean;
  Logo?: React.ReactNode;
  paragraphProps?: ParagraphProps;
};

const CustomButton: React.FC<Props> = ({
  title,
  children,
  color = 'primary',
  type = 'lg',
  paragraphColor,
  isInline,
  isLoading,
  Logo,
  paragraphProps,
  ...rest
}) => {
  const {disabled, style, className, ...other} = rest;

  const buttonStyles: ViewStyle = {
    backgroundColor: !isInline
      ? disabled
        ? appColors.gray
        : appColors[color]
      : undefined,
    borderColor: isInline
      ? disabled
        ? appColors.gray
        : appColors[color]
      : undefined,
    borderWidth: isInline ? 1 : 0,
    width: type === 'lg' ? '100%' : 100,
    height: type === 'lg' ? 55 : 33,
  };

  return (
    <TouchableOpacity
      className={`!items-center !justify-center !rounded-full ${className}`}
      activeOpacity={0.7}
      style={[buttonStyles, style]}
      disabled={disabled || isLoading}
      {...other}>
      {isLoading ? (
        <ActivityIndicator
          size={'small'}
          color={isInline ? appColors.primary : appColors.white}
        />
      ) : (
        <View className={'gap-5 flex-row items-center justify-center'}>
          {Logo}
          <Paragraph
            size={type === 'lg' ? 20 : 15}
            weight={'600'}
            color={
              paragraphColor || isInline ? (disabled ? 'gray' : color) : 'white'
            }
            {...paragraphProps}>
            {title || children}
          </Paragraph>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
