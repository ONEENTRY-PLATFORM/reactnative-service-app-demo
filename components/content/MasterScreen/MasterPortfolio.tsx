import React, {useMemo, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {useGetPagesByIdsQuery} from '@/api';
import Footer from '@/components/shared/Footer';
import CardBase from '@/components/shared/CardBase';
import CustomImage from '@/components/shared/CustomImage';
import CollectionSliderModal from '@/components/shared/CollectionSliderModal';

const GalleryCategoryItem = ({
  imageUrl,
  onPress,
}: {
  imageUrl: string;
  onPress: () => void;
}) => {
  return (
    <CardBase onPress={() => onPress()}>
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

type Props = {
  portfolio: number[];
};

const MasterPortfolio: React.FC<Props> = ({portfolio}) => {
  const {data, isLoading} = useGetPagesByIdsQuery({ids: portfolio});
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

  if (isLoading) {
    return <View className={'flex-1 animate-pulse bg-gray'} />;
  }

  return (
    <View className={'gap-5 bg-white'}>
      <Paragraph color={'dark'} size={18}>
        Portfolio
      </Paragraph>
      <FlatList
        numColumns={2}
        contentContainerStyle={{gap: 20}}
        columnWrapperStyle={{justifyContent: 'space-between'}}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<Footer />}
        scrollEnabled={false}
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
    </View>
  );
};

export default MasterPortfolio;
