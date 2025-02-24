import React from 'react';
import {ImageBackground, TouchableOpacity} from 'react-native';
import CustomImage from '@/components/shared/CustomImage';
import {Paragraph} from '@/components/shared/Paragraph';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {Screen} from '@/components/shared/Screen';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {layoutPadding} from '@/constants/sizes';

type Props = {
  attributes?: Record<string, any>;
  scrollY: SharedValue<number>;
};

const TopHomeBanner: React.FC<Props> = ({attributes, scrollY}) => {
  const {top} = useSafeAreaInsets();
  const animatedColorStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollY.value,
      [0, 100],
      ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'], // From transparent to white
    );

    return {
      backgroundColor,
    };
  });
  const animatedInnerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, 100],
      [200, 60],
      Extrapolation.CLAMP,
    );

    return {
      height,
    };
  });

  const animatedOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
    };
  });

  return (
    <TouchableOpacity activeOpacity={0.7}>
      <ImageBackground
        source={{
          uri: attributes?.background?.value[0]?.downloadLink,
        }}>
        <Animated.View style={[animatedColorStyle]}>
          <Screen style={{paddingTop: top}} edges={['top', 'horizontal']}>
            <Animated.View className={'w-full'} style={[animatedInnerStyle]}>
              <CustomImage
                containerStyle={{
                  position: 'absolute',
                  right: 0,
                }}
                height={42}
                width={152}
                uri={attributes?.logo?.value[0]?.downloadLink}
              />
              <Animated.View
                style={[animatedOpacityStyle]}
                className={
                  'absolute bottom-layout flex-row justify-between items-end right-0 left-0'
                }>
                <ImageBackground
                  className={`w-[131px] h-[131px] items-center justify-center object-contain`}
                  source={{
                    uri: attributes?.offer?.value[0]?.extended?.value
                      ?.downloadLink,
                  }}>
                  <Paragraph size={44} color={'white'} weight={'700'}>
                    -{attributes?.offer?.value[0]?.value}
                    <Paragraph color={'white'} weight={'700'} size={22}>
                      %
                    </Paragraph>
                  </Paragraph>
                </ImageBackground>
                <Paragraph
                  style={{
                    maxWidth: 220,
                  }}
                  className={'pt-11 leading-10 text-right'}
                  size={38}
                  color={'white'}
                  weight={'600'}>
                  {attributes?.offer?.value[0]?.title?.toUpperCase()}
                </Paragraph>
              </Animated.View>
            </Animated.View>
          </Screen>
        </Animated.View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default TopHomeBanner;
