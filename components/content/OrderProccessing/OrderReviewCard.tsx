import React from 'react';
import CustomImage from '@/components/shared/CustomImage';
import CardBase from '@/components/shared/CardBase';
import {View} from 'react-native';
import {useAppSelector} from '@/state/hooks';
import {Paragraph} from '@/components/shared/Paragraph';
import Rating from '@/components/shared/Rating';
import dayjs from 'dayjs';
import {appColors} from '@/constants/Colors';
import {Redirect} from 'expo-router';

type Props = {};

const OrderReviewCard: React.FC<Props> = ({}) => {
  const {master, service, salon, date, time} = useAppSelector(
    state => state.OrderReducer,
  );

  if (!master || !service) {
    return <Redirect href={'/(tabs)/booking'} />;
  }

  return (
    <CardBase
      outlineColor={appColors.primary}
      outline
      onPress={() => {}}
      touchableOpacityProps={{className: 'rounded-lg p-2'}}
      className={'flex-row gap-4'}>
      <CustomImage
        height={133}
        width={114}
        className={'rounded-lg'}
        style={{objectFit: 'cover'}}
        uri={master?.attributeValues?.master_image?.value[0]?.downloadLink}
      />
      <View className={'flex-1 justify-between py-2'}>
        <View className={'gap-y-1'}>
          <Paragraph color={'dark'} size={18}>
            {master?.attributeValues?.master_name?.value}
          </Paragraph>
          <Rating
            color={'#0EDEFB'}
            shorten={false}
            rating={master?.attributeValues?.master_rating?.value}
          />
        </View>
        <View className={'py-2.5'}>
          <Paragraph color={'dark'} size={16}>
            {salon?.localizeInfos?.title?.toUpperCase()}
          </Paragraph>
          <Paragraph size={13}>
            {salon?.attributeValues?.salon_address?.value}
          </Paragraph>
        </View>
        <View className={'w-full h-0.5 my-2 bg-gray'} />
        <View className={'gap-y-2'}>
          <Paragraph color={'dark'} size={16} weight={'400'}>
            {service?.localizeInfos?.title}
          </Paragraph>
          <Paragraph
            size={16}
            color={'dark'}
            style={{textDecorationLine: 'underline'}}>
            {dayjs(date).format('DD.MM.YYYY')}
          </Paragraph>
          <Paragraph size={16} color={'primary'} weight={'400'}>
            {time}:00
          </Paragraph>
        </View>
      </View>
    </CardBase>
  );
};

export default OrderReviewCard;
