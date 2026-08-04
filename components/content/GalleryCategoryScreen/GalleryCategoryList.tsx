import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useFocusEffect, useLocalSearchParams} from 'expo-router';
import {useGetChildPagesByUrlQuery, useLazyGetChildPagesByUrlQuery} from '@/api';
import Footer from '@/components/shared/Footer';
import CardBase from '@/components/shared/CardBase';
import CustomImage from '@/components/shared/CustomImage';
import {FlatList, Platform, View} from 'react-native';
import CollectionSliderModal from '@/components/shared/CollectionSliderModal';
import { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

const GalleryCategoryItem = ({
  imageUrl,
  onPress,
}: {
  imageUrl: string;
  onPress: () => void;
}) => {
  return (
    <CardBase onPress={onPress}>
      <CustomImage
        height={165}
        width={165}
        className={'rounded-lg'}
        style={{objectFit: 'cover', marginTop: 5}}
        uri={imageUrl}
      />
    </CardBase>
  );
};

type Props = {};

const GalleryCategoryList: React.FC<Props> = ({}) => {
  const {marker} = useLocalSearchParams();
  const [getPages, {data, reset}] = useLazyGetChildPagesByUrlQuery({});
  const defaultInd = useRef<number | undefined>();
  const [visible, setVisible] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      getPages({url: marker as string});
      return () => {
        reset();
      };
    }, [marker]),
  );

  const sortedImages = useMemo(() => {
    if (!data) {
      return [];
    }

    const result: any[] = [];
    // Create a deep copy to avoid modifying the original data
    const items = JSON.parse(JSON.stringify(data));

    let hasMoreImages = true;

    while (hasMoreImages) {
      hasMoreImages = false; // Assume no more images to process

      items.forEach((item: IPagesEntity) => {
        const gallery = item?.attributeValues?.gallery_photos?.value;
        if (gallery && gallery.length > 0) {
          hasMoreImages = true; // If there are images, set flag to true
          // Take the first 2 images from the gallery
          const imagesToAdd = gallery.slice(0, 2);
          // Add them to the result array
          result.push(...imagesToAdd);
          // Update the copied gallery array (immutably)
          item.attributeValues.gallery_photos.value = gallery.slice(2);
        }
      });
    }

    return result;
  }, [data]);
  return (
    <>
      <FlatList
        numColumns={2}
        contentContainerStyle={{gap: 20}}
        columnWrapperStyle={{justifyContent: 'space-between'}}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<Footer />}
        data={sortedImages}
        renderItem={({item, index}) => (
          <GalleryCategoryItem
            onPress={() => {
              defaultInd.current = index;
              setVisible(true);
            }}
            imageUrl={item.downloadLink}
          />
        )}
      />
      <View className={Platform.OS === 'android' ? 'flex-1' : ''}>
        <CollectionSliderModal
          defaultIndex={defaultInd.current}
          visible={visible}
          setVisible={setVisible}
          items={sortedImages}
        />
      </View>
    </>
  );
};

export default GalleryCategoryList;
