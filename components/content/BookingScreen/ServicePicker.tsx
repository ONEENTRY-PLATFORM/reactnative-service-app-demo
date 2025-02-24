import React from 'react';
import {FlatList} from 'react-native';
import {useAppSelector} from '@/state/hooks';
import CustomButton from '@/components/shared/CustomButton';
import {router} from 'expo-router';
import {appColors} from '@/constants/Colors';

type Props = {};

const ServicePicker: React.FC<Props> = ({}) => {
  const categories = useAppSelector(
    state => state.CatalogCategoriesReducer.categories,
  );
  return (
    <FlatList
      data={categories}
      className={'mt-[30px]'}
      contentContainerStyle={{gap: 15}}
      renderItem={({item}) => (
        <CustomButton
          title={item?.localizeInfos?.title}
          isInline
          paragraphProps={{weight: '400', color: 'dark', size: 17}}
          style={{height: 42, borderColor: appColors.gray}}
          onPress={() => router.navigate(`/(tabs)/catalog/${item.pageUrl}`)}
        />
      )}
      scrollEnabled={false}
    />
  );
};

export default ServicePicker;
