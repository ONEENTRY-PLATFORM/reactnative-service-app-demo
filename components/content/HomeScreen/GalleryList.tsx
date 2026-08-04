import React, {useMemo} from 'react';
import {Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useAppSelector} from '@/state/hooks';
import {router} from 'expo-router';
import CustomImage from '@/components/shared/CustomImage';

// Home gallery strip. Mirrors nextjs-beauty GalleryFeed: a 2-column
// edge-to-edge grid with 4/5 aspect tiles. Web sources 6 shuffled photos
// from each gallery category's `gallery_photos` attribute; here we render
// whatever thumbnails are available on the gallery children pages and, when
// missing, fall back to the master portrait pool.

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const HORIZONTAL_PADDING = 20 * 2;
const GAP = 12;
const COLUMN_COUNT = 2;
const TILE_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING - GAP) / COLUMN_COUNT;
const TILE_HEIGHT = TILE_WIDTH * (5 / 4);

const GalleryList: React.FC = () => {
  const gallery = useAppSelector(state => state.GalleryReducer.gallery);
  const masters = useAppSelector(state => state.MastersReducer.masters);

  // Prefer real gallery thumbnails, fall back to master portraits so the
  // strip is never blank. Cap at six.
  const tiles = useMemo(() => {
    const fromGallery: string[] = (gallery ?? [])
      .flatMap((item: any) => {
        const arr = item?.attributeValues?.gallery_photos?.value;
        if (Array.isArray(arr)) {
          return arr
            .map((f: any) => f?.downloadLink)
            .filter(Boolean) as string[];
        }
        const thumb = item?.attributeValues?.gallery_cat_thumb?.value?.[0]
          ?.downloadLink as string | undefined;
        return thumb ? [thumb] : [];
      })
      .filter(Boolean);
    if (fromGallery.length >= 6) return fromGallery.slice(0, 6);
    const fromMasters: string[] = (masters ?? [])
      .map(
        m =>
          m?.attributeValues?.master_image?.value?.[0]?.downloadLink as
            | string
            | undefined,
      )
      .filter(Boolean) as string[];
    return [...fromGallery, ...fromMasters].slice(0, 6);
  }, [gallery, masters]);

  if (tiles.length === 0) return null;

  return (
    <View style={styles.grid}>
      {tiles.map((uri, index) => (
        <TouchableOpacity
          key={`${uri}-${index}`}
          activeOpacity={0.85}
          onPress={() => router.navigate('/(tabs)/gallery')}
          style={styles.tile}>
          <CustomImage
            width={TILE_WIDTH}
            height={TILE_HEIGHT}
            uri={uri}
            style={{objectFit: 'cover'}}
            className={'rounded-md'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  tile: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default GalleryList;
