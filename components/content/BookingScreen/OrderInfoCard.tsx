import React from 'react';
import CardBase from '@/components/shared/CardBase';
import CustomImage from '@/components/shared/CustomImage';
import {useAppSelector} from '@/state/hooks';
import {Paragraph} from '@/components/shared/Paragraph';
import {View} from 'react-native';
import {appColors} from '@/constants/Colors';
import Rating from '@/components/shared/Rating';
import {MasterSalon} from '@/components/content/MasterScreen/MasterSalonsList';

type Props = {};

const OrderInfoCard: React.FC<Props> = ({}) => {
  const {master, service, salon} = useAppSelector(state => state.OrderReducer);
  return (
    <CardBase
      outline
      outlineColor={appColors.primary}
      touchableOpacityProps={{
        className: 'rounded-md',
      }}
      className={'flex-row gap-x-5 h-[120px]'}
      onPress={() => {}}>
      <CustomImage
        height={120}
        width={95}
        className={'rounded-md'}
        style={{objectFit: 'cover'}}
        uri={master?.attributeValues?.master_image?.value[0]?.downloadLink}
      />
      <View className={'flex-1 justify-around py-2'}>
        <View className={'gap-y-1'}>
          <Paragraph color={'dark'} size={18}>
            {master?.attributeValues?.master_name?.value}
          </Paragraph>
          <Paragraph color={'primary'} size={12} weight={'600'}>
            {service?.localizeInfos?.title}
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
          <MasterSalon title={salon?.attributeValues?.salon_address?.value} />
        </View>
      </View>
    </CardBase>
  );
};

export default OrderInfoCard;
