import React from 'react';
import ServiceSelectCard from '@/components/content/CatalogScreen/ServiceSelectCard';
import {FlatList, StyleSheet, View} from 'react-native';
import {IProductsEntity} from 'oneentry/dist/products/productsInterfaces';
import {appColors} from '@/lib/constants/Colors';
import {attrEntries} from '@/lib/oneentry/attributes';
import {Paragraph} from '@/components/shared/Paragraph';

type Props = {
  categoryObj: {
    title: string;
    data: IProductsEntity[];
  };
};

const ServicesByCategoryList: React.FC<Props> = ({categoryObj}) => {
  const category = categoryObj.data;
  const borderColor = attrEntries<Record<any, any>>(
    category[0]?.attributeValues?.offer_type,
  )[0]?.extended?.value;

  return (
    <View
      style={{
        borderColor: borderColor || appColors.primary,
      }}
      className={'my-4 py-4 border-sm rounded-sm'}>
      {borderColor && (
        <Paragraph
          className={'px-2.5 mb-1'}
          style={{color: borderColor}}
          size={16}
          weight={600}>
          {categoryObj.title?.toUpperCase()}
        </Paragraph>
      )}
      <FlatList
        data={category}
        style={{
          borderColor: borderColor || appColors.primary,
        }}
        contentContainerStyle={styles.container}
        className={''}
        scrollEnabled={false}
        renderItem={({item}) => <ServiceSelectCard service={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 25,
  },
});

export default ServicesByCategoryList;
