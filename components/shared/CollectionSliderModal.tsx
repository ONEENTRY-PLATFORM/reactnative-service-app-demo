import React, {Dispatch, useRef} from 'react';
import {Modal, Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Carousel, CarouselRef} from 'react-native-reanimated-carousel';
import {Screen} from '@/components/shared/Screen';
import CustomImage from '@/components/shared/CustomImage';
import {layoutWidth} from '@/lib/constants/sizes';
import ArrowLeft from '@/assets/icons/Arrow.svg';
import X from '@/assets/icons/x.svg';

interface Props {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  items: {
    downloadLink: string;
    [key: string]: any;
  }[];
  defaultIndex?: number;
}

const CollectionSliderModal: React.FC<Props> = ({
  visible,
  setVisible,
  items,
  defaultIndex,
}) => {
  const ref = useRef<CarouselRef | null>(null);

  return (
    <Modal
      onRequestClose={() => setVisible(!visible)}
      transparent
      visible={visible}>
      <Screen
        edges={['horizontal']}
        style={{
          backgroundColor: 'rgba(147, 66, 149, 0.9)',
          alignItems: 'center',
          height: '100%',
          justifyContent: 'center',
          gap: 10,
        }}>
        <View className={'w-full justify-end items-end'}>
          <TouchableOpacity
            onPress={() => setVisible(false)}
            className={'rounded-full border-sm border-white p-4'}>
            <X />
          </TouchableOpacity>
        </View>
        <View style={{height: 520}}>
          <Carousel
            ref={ref as React.Ref<CarouselRef>}
            loop={false}
            autoplay={false}
            itemSize={layoutWidth}
            style={{height: 520, width: layoutWidth}}
            data={items}
            defaultIndex={defaultIndex}
            renderItem={({item}: {item: (typeof items)[number]}) => (
              <CustomImage
                uri={item.downloadLink}
                height={520}
                width={layoutWidth}
                style={{objectFit: 'cover', borderRadius: 20}}
              />
            )}
          />
        </View>
        <View className={'justify-between items-start flex-row w-full mt-2.5'}>
          <TouchableOpacity
            className={'p-2'}
            onPress={() => ref.current?.prev()}>
            <ArrowLeft />
          </TouchableOpacity>
          <TouchableOpacity
            className={'-scale-x-100 p-2'}
            onPress={() => ref.current?.next()}>
            <ArrowLeft />
          </TouchableOpacity>
        </View>
      </Screen>
    </Modal>
  );
};

export default CollectionSliderModal;
