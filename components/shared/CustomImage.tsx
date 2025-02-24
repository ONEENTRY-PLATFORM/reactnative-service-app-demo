import React, {memo} from 'react';
import {SvgUri} from 'react-native-svg';
import {Image, ImageStyle, StyleProp, View, ViewStyle} from 'react-native';

type CombinedStyle = ImageStyle | StyleProp<ViewStyle>;

type Props = {
  uri: string | undefined;
  width: number | 'full';
  height: number | 'full';
  color?: string;
  style?: CombinedStyle;
  className?: string;
  containerStyle?: ViewStyle;
};
const CustomImage: React.FC<Props> = ({
  uri,
  height,
  width,
  style,
  color,
  className,
  containerStyle,
}) => {
  const type = uri?.split('.').pop();

  return (
    <View
      className={`${!type && 'animate-pulse'} rounded-md `}
      style={[
        {
          backgroundColor: type ? 'transparent' : '#eaecee',
          width: width === 'full' ? '100%' : width,
          height: height === 'full' ? '100%' : height,
        },
        containerStyle,
      ]}>
      {type === 'svg' ? (
        <SvgUri
          height={height === 'full' ? '100%' : height}
          width={width === 'full' ? '100%' : width}
          color={color || undefined}
          style={style as StyleProp<ViewStyle>}
          uri={uri || ''}
        />
      ) : (
        <Image
          style={[
            {
              tintColor: color,
              objectFit: 'contain',
              width: width === 'full' ? '100%' : width,
              height: height === 'full' ? '100%' : height,
            },
            style as ImageStyle,
          ]}
          className={className}
          source={{uri}}
        />
      )}
    </View>
  );
};

export default memo(CustomImage);
