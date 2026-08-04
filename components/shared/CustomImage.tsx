import React, {memo, useRef, useState} from 'react';
import {ImageStyle, StyleProp, View, ViewStyle} from 'react-native';
import {Image, ImageContentFit} from 'expo-image';

type CombinedStyle = ImageStyle | StyleProp<ViewStyle>;

type Props = {
  uri: string | undefined;
  width: number | 'full';
  height: number | 'full';
  color?: string;
  style?: CombinedStyle;
  className?: string;
  containerStyle?: ViewStyle;
  rounded?: boolean;
  contentFit?: ImageContentFit | undefined;
};
const CustomImage: React.FC<Props> = ({
  uri,
  height,
  width,
  style,
  color,
  className,
  containerStyle,
  rounded = true,
  contentFit,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  return (
    <View
      className={`rounded-md ${isLoading && 'animate-pulse'}`}
      style={[
        {
          backgroundColor: !isLoading ? 'transparent' : '#eaecee',
          width: width === 'full' ? '100%' : width,
          height: height === 'full' ? '100%' : height,
        },
        containerStyle,
      ]}>
      <Image
        onLoad={() => setIsLoading(false)}
        style={[
          {
            tintColor: color,
            width: width === 'full' ? '100%' : width,
            height: height === 'full' ? '100%' : height,
            borderRadius: rounded ? 15 : 0,
          },
          style as ImageStyle,
        ]}
        contentFit={contentFit || 'cover'}
        className={className}
        source={{uri}}
      />
    </View>
  );
};

export default memo(CustomImage);
