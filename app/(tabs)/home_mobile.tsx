import {Screen} from '@/components/shared/Screen';
import ServiceCardsList from '@/components/content/HomeScreen/ServiceCardsList';
import {useGetBlocksByPageUrlQuery} from '@/api';
import TopHomeBanner from '@/components/content/HomeScreen/TopHomeBanner';
import {View} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import SalonPicker from '@/components/shared/SalonPicker';
import SpecialOffersList from '@/components/content/HomeScreen/SpecialOffersList';
import MastersList from '@/components/content/HomeScreen/MastersList';
import {useMemo} from 'react';
import {IPositionBlock} from 'oneentry/dist/pages/pagesInterfaces';
import Footer from '@/components/shared/Footer';
import GalleryList from '@/components/content/HomeScreen/GalleryList';

export default function HomeScreen() {
  const {data: blocks, error} = useGetBlocksByPageUrlQuery({
    pageUrl: 'home_mobile',
  });

  const {banner, offers, gallery} = useMemo((): {
    banner: IPositionBlock | undefined;
    offers: IPositionBlock | undefined;
    gallery: IPositionBlock | undefined;
  } => {
    let banner: IPositionBlock | undefined,
      offers: IPositionBlock | undefined,
      gallery: IPositionBlock | undefined;
    if (blocks) {
      blocks.map(block => {
        switch (block.identifier) {
          case 'top_home_banner':
            banner = block;
            return;
          case 'home_offers_feed':
            offers = block;
            return;
          case 'gallery_feed':
            gallery = block;
            return;
        }
      });
    }

    return {banner, offers, gallery};
  }, [blocks]);

  //Header animations
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  if (error) throw error;

  return (
    <View>
      <TopHomeBanner scrollY={scrollY} attributes={banner?.attributeValues} />
      <Screen edges={['horizontal']}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          className={'pt-8'}
          contentContainerStyle={{gap: 20}}
          onScroll={scrollHandler}>
          <ServiceCardsList />
          <SalonPicker />
          {offers && <SpecialOffersList identifier={offers.identifier} />}
          <MastersList title={'Masters'} />
          {gallery && <GalleryList title={gallery?.localizeInfos?.title} />}
          <Footer height={200} />
        </Animated.ScrollView>
      </Screen>
    </View>
  );
}
