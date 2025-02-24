import React from 'react';
import {Paragraph} from '@/components/shared/Paragraph';
import {FlatList, View} from 'react-native';
import {useAppSelector} from '@/state/hooks';
import CardBase from '@/components/shared/CardBase';
import {router} from 'expo-router';
import CustomImage from '@/components/shared/CustomImage';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';

const GalleryCard = ({galleryItem}: {galleryItem: IPagesEntity}) => {
  return (
    <CardBase onPress={() => router.navigate(`/(tabs)/gallery`)}>
      <CustomImage
        width={140}
        height={150}
        uri={
          galleryItem?.attributeValues?.gallery_cat_thumb?.value[0]
            ?.downloadLink
        }
        style={{objectFit: 'cover'}}
        className={'rounded-lg'}
      />
    </CardBase>
  );
};

type Props = {
  title: string;
};

const GalleryList: React.FC<Props> = ({title}) => {
  const gallery = useAppSelector(state => state.GalleryReducer.gallery);
  return (
    <View className={'gap-5'}>
      <Paragraph size={18} color={'dark'}>
        {title?.toUpperCase()}
      </Paragraph>
      <FlatList
        horizontal
        data={gallery}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{gap: 10}}
        renderItem={({item, index}) => <GalleryCard galleryItem={item} />}
      />
    </View>
  );
};

export default GalleryList;
