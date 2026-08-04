import React from 'react';
import {FlatList} from 'react-native';
import {getCatalogCategories} from '@/state/reducers/CatalogCategoriesSlice';
import {useAppSelector} from '@/state/hooks';
import ServiceCard from '@/components/content/HomeScreen/ServiceCard';

// Four category tiles (hair/face/body/nails). Kept as a horizontal FlatList
// so it also handles longer catalogs gracefully — the previous 3-column
// vertical grid clipped on the right side once there were 4+ items.
const ServiceCardsList: React.FC = () => {
  const categories = useAppSelector(state => getCatalogCategories(state));

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <FlatList
      data={categories}
      horizontal
      renderItem={({item}) => <ServiceCard service={item} />}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={{gap: 16, paddingVertical: 4}}
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default ServiceCardsList;
