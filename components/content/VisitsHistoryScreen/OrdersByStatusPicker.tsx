import React, {Dispatch, useEffect, useRef} from 'react';
import {Animated, TouchableOpacity, View} from 'react-native';
import {layoutPadding, layoutWidth, screenWidth} from '@/lib/constants/sizes';
import {appColors} from '@/lib/constants/Colors';
import {Paragraph} from '@/components/shared/Paragraph';
import {number} from 'prop-types';

type TabProps = {
  categoryName: string;
  setCategory: () => void;
  active: boolean;
};

const TabForStatusPicker: React.FC<TabProps> = ({
  categoryName,
  active,
  setCategory,
}) => {
  return (
    <View>
      <TouchableOpacity
        onPress={setCategory}
        style={{width: layoutWidth / 3}}
        className={`pt-3 pb-6 items-center justify-center`}>
        <Paragraph
          weight={'600'}
          size={16}
          className={'text-center'}
          color={(active && 'primary') || 'lightGray'}>
          {categoryName}
        </Paragraph>
      </TouchableOpacity>
    </View>
  );
};

type Props = {
  category: number;
  setCategory: Dispatch<number>;
};

const tabs = ['upcoming', 'completed', 'canceled'];

const OrdersByStatusPicker: React.FC<Props> = ({category, setCategory}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(translateX, {
      toValue: (layoutWidth / 3) * category,
      useNativeDriver: true,
    }).start();
  }, [category]);

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: layoutWidth,
        }}>
        {tabs.map((item, index) => (
          <TabForStatusPicker
            key={index}
            setCategory={() => setCategory(index)}
            categoryName={item}
            active={category === tabs.indexOf(item)}
          />
        ))}
      </View>
      <View className={'w-full h-[1px] bg-lightGray'} />
      <Animated.View
        style={{
          height: 2,
          width: layoutWidth / 3,
          backgroundColor: appColors.primary,
          position: 'absolute',
          bottom: -2,
          left: 0,
          transform: [{translateX}],
        }}
      />
    </View>
  );
};

export default OrdersByStatusPicker;
