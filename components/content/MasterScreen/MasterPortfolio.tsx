import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Paragraph } from '@/components/shared/Paragraph';
import { useLazyGetPagesByIdsQuery } from '@/api';
import Footer from '@/components/shared/Footer';
import CardBase from '@/components/shared/CardBase';
import CustomImage from '@/components/shared/CustomImage';
import CollectionSliderModal from '@/components/shared/CollectionSliderModal';
import {attrFiles} from '@/lib/oneentry/attributes';
import type {IAttributeFile} from 'oneentry/dist/base/utils';
import { useFocusEffect } from 'expo-router';

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
        style={{ objectFit: 'cover', marginTop: 5 }}
        uri={imageUrl}
      />
    </CardBase>
  );
};

type Props = {
  portfolio: number[];
};

const MasterPortfolio: React.FC<Props> = ({ portfolio }) => {
  const [getPages, { data, isLoading, reset }] = useLazyGetPagesByIdsQuery({});
  const defaultInd = useRef<number | undefined>();
  const [visible, setVisible] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      getPages({ ids: portfolio });
      return () => {
        reset();
      };
    }, [portfolio]),
  );

  const sortedImages = useMemo(() => {
    if (!data) {
      return [];
    }

    const result: IAttributeFile[] = [];
    // Own copy of every gallery so draining it below leaves the store intact.
    const galleries = data.map(item =>
      attrFiles(item?.attributeValues?.gallery_photos),
    );

    let hasMoreImages = true;

    while (hasMoreImages) {
      hasMoreImages = false; // Assume no more images to process

      galleries.forEach((gallery, index) => {
        if (gallery.length > 0) {
          hasMoreImages = true; // If there are images, set flag to true
          // Take the first 2 images from the gallery
          result.push(...gallery.slice(0, 2));
          galleries[index] = gallery.slice(2);
        }
      });
    }

    return result;
  }, [data]);

  if (isLoading || !data) {
    return <View className={'flex-1 animate-pulse bg-gray'} />;
  }

  return (
    <View className={'gap-5 bg-white'}>
      <Paragraph color={'dark'} size={18}>
        Portfolio
      </Paragraph>
      <FlatList
        numColumns={2}
        contentContainerStyle={{ gap: 20 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<Footer />}
        scrollEnabled={false}
        data={sortedImages}
        renderItem={({ item, index }) => (
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
