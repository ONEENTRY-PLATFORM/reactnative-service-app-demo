import React from 'react';
import CardBase from '@/components/shared/CardBase';
import CustomImage from '@/components/shared/CustomImage';
import {attrFileUrl, attrNumber, attrText} from '@/lib/oneentry/attributes';
import {useAppSelector} from '@/state/hooks';
import {Paragraph} from '@/components/shared/Paragraph';
import {View} from 'react-native';
import {appColors} from '@/lib/constants/Colors';
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
      className={'flex-row gap-x-5'}
      onPress={() => {}}>
      <CustomImage
        width={95}
        className={'rounded-md'}
        style={{objectFit: 'cover', flex: 1}}
        uri={attrFileUrl(master?.attributeValues?.master_image)}
      />
      <View className={'flex-1 justify-around py-2'}>
        <View className={'gap-y-1'}>
          <Paragraph color={'dark'} size={18}>
            {attrText(master?.attributeValues?.master_name)}
          </Paragraph>
          <Paragraph color={'primary'} size={12} weight={'600'}>
            {service?.localizeInfos?.title}
          </Paragraph>
          <Rating
            color={'#0EDEFB'}
            shorten={false}
            rating={attrNumber(master?.attributeValues?.master_rating) ?? 0}
          />
        </View>
        <View className={'pt-2.5'}>
          <Paragraph color={'dark'} size={16}>
            {salon?.localizeInfos?.title?.toUpperCase()}
          </Paragraph>
          <MasterSalon
            title={attrText(salon?.attributeValues?.salon_address)}
          />
        </View>
      </View>
    </CardBase>
  );
};

export default OrderInfoCard;
