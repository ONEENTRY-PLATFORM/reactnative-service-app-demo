import React, {useEffect, useMemo} from 'react';
import {Screen} from '@/components/shared/Screen';
import {useLocalSearchParams, useNavigation} from 'expo-router';
import GalleryCategoryList from '@/components/content/GalleryCategoryScreen/GalleryCategoryList';

type Props = {};

const CategoryGallery: React.FC<Props> = ({}) => {
  const {title} = useLocalSearchParams();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title, // Set the header title
    });
  }, [navigation, title]);

  return (
    <Screen edges={['top', 'horizontal']}>
      <GalleryCategoryList />
    </Screen>
  );
};

export default CategoryGallery;
