import React from 'react';
import {useGetChildPagesByUrlQuery} from '@/api';
import {Screen} from '@/components/shared/Screen';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';
import {FlatList} from 'react-native';
import GalleryItemCard from '@/components/content/GalleryScreen/GalleryItemCard';
import {useAppSelector} from '@/state/hooks';

type Props = {};

const GalleryCatalog: React.FC<Props> = ({}) => {
  const gallery = useAppSelector(state => state.GalleryReducer.gallery);

  const onPress = (product: IPagesEntity) => {};

  if (!gallery) {
    return <Screen isFull className={'animate-pulse'}></Screen>;
  }

  return (
    <FlatList
      data={gallery}
      renderItem={({item}) => <GalleryItemCard page={item} />}
      numColumns={2}
      contentContainerStyle={{gap: 20}}
      columnWrapperStyle={{justifyContent: 'space-between'}}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
};

export default GalleryCatalog;
