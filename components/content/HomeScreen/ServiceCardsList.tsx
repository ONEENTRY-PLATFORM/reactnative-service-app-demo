import React from 'react';
import {FlatList} from 'react-native';
import {getCatalogCategories} from '@/state/reducers/CatalogCategoriesSlice';
import {useAppSelector} from '@/state/hooks';
import ServiceCard from '@/components/content/HomeScreen/ServiceCard';
import {proportionX} from '@/constants/sizes';

type Props = {};

const ServiceCardsList: React.FC<Props> = ({}) => {
  const categories = useAppSelector(state => getCatalogCategories(state));
  return (
    <FlatList
      data={categories}
      className={'self-center'}
      renderItem={({item, index}) => <ServiceCard service={item} />}
      numColumns={3}
      keyExtractor={(_, index) => index.toString()}
      columnWrapperStyle={{
        gap: 62 * proportionX,
      }}
      contentContainerStyle={{gap: 24}}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
};

export default ServiceCardsList;
