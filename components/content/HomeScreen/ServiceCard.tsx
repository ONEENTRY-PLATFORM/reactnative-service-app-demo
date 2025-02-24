import React from 'react';
import CardBase from '@/components/shared/CardBase';
import {View} from 'react-native';
import CustomImage from '@/components/shared/CustomImage';
import {Paragraph} from '@/components/shared/Paragraph';
import {router} from 'expo-router';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';

type Props = {
  service: IPagesEntity;
};

const ServiceCard: React.FC<Props> = ({service}) => {
  return (
    <CardBase onPress={() => router.navigate(`/catalog/${service.pageUrl}?title=${service?.localizeInfos?.title}`)}>
      <View>
        <CustomImage
          height={75}
          width={68}
          uri={service?.attributeValues?.logo?.value?.[0]?.downloadLink}
        />
        <Paragraph className={'text-center'} size={14} color={'dark'}>
          {service?.localizeInfos?.title?.toString().toUpperCase()}
        </Paragraph>
      </View>
    </CardBase>
  );
};

export default ServiceCard;
