import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import CardBase from '@/components/shared/CardBase';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';
import CustomImage from '@/components/shared/CustomImage';
import {router} from 'expo-router';

interface Props {
  page?: IPagesEntity;
}

const GalleryItemCard: React.FC<Props> = ({page}) => {
  return (
    <CardBase
      title={page?.localizeInfos?.title?.toString()?.toUpperCase()}
      onPress={() => router.push(`/(tabs)/gallery/${page?.pageUrl}?title=${page?.localizeInfos?.title?.toString()}`)}>
      <CustomImage
        height={165}
        width={165}
        className={'rounded-lg'}
        style={{objectFit: 'cover', marginTop: 5}}
        uri={page?.attributeValues?.gallery_cat_thumb?.value[0]?.downloadLink}
      />
    </CardBase>
  );
};

export default GalleryItemCard;
