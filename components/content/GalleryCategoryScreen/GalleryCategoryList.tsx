import React, {useMemo, useRef, useState} from 'react';
import {useLocalSearchParams} from 'expo-router';
import {useGetChildPagesByUrlQuery} from '@/api';
import Footer from '@/components/shared/Footer';
import CardBase from '@/components/shared/CardBase';
import CustomImage from '@/components/shared/CustomImage';
import {FlatList} from 'react-native';
import CollectionSliderModal from '@/components/shared/CollectionSliderModal';

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
  const {data} = useGetChildPagesByUrlQuery({url: marker as string});
  const defaultInd = useRef<number | undefined>();
  const [visible, setVisible] = useState<boolean>(false);

  const sortedImages = useMemo(() => {
    if (!data) {
      return [];
    }

    const result: any[] = [];
    // Create a deep copy to avoid modifying the original data
    const items = data.map(item => ({
      ...item,
      attributeValues: {
        ...item.attributeValues,
        gallery_photos: {
          ...item.attributeValues.gallery_photos,
          value: [...item.attributeValues.gallery_photos.value],
        },
      },
    }));

    let hasMoreImages = true;

    while (hasMoreImages) {
      hasMoreImages = false; // Assume no more images to process

      items.forEach(item => {
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
      <CollectionSliderModal
        defaultIndex={defaultInd.current}
        visible={visible}
        setVisible={setVisible}
        items={sortedImages}
      />
    </>
  );
};

export default GalleryCategoryList;
