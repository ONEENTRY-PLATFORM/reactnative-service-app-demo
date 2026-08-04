import {ScrollView, View} from 'react-native';
import {useMemo} from 'react';
import {IPositionBlock} from 'oneentry/dist/pages/pagesInterfaces';
import {Screen} from '@/components/shared/Screen';
import {useGetBlocksByPageUrlQuery} from '@/api';
import TopHomeBanner from '@/components/content/HomeScreen/TopHomeBanner';
import ServiceCardsList from '@/components/content/HomeScreen/ServiceCardsList';
import SpecialOffersList from '@/components/content/HomeScreen/SpecialOffersList';
import MastersList from '@/components/content/HomeScreen/MastersList';
import GalleryList from '@/components/content/HomeScreen/GalleryList';
import HomeCtaBanner from '@/components/content/HomeScreen/HomeCtaBanner';
import ReviewsCarousel from '@/components/content/HomeScreen/ReviewsCarousel';
import SectionTitle from '@/components/shared/SectionTitle';
import Footer from '@/components/shared/Footer';
import FlexLoader from '@/components/shared/FlexLoader';
import {useAppSelector} from '@/state/hooks';

// Home screen layout matches nextjs-beauty's `/` page order (see
// apps/nextjs-beauty/app/page.tsx):
//   1. HomeHero        — home_hero        (slider_block)
//   2. CatalogSection  — home_catalog     — "Service" title
//   3. GalleryFeed     — home_gallery     — "Gallery" title
//   4. OffersFeed      — home_offers_feed — "Best Offers" title
//   5. HomeCtaBanner   — home_discounts   — booking CTA banner
//   6. MastersFeed     — home_masters     — "Our Specialists" title
//   7. ReviewsCarousel — mock             — "Reviews" title
// SalonPicker was removed from home (it doesn't exist on web home).
export default function HomeScreen() {
  const {
    data: blocks,
    error,
    isLoading,
  } = useGetBlocksByPageUrlQuery({pageUrl: 'home'});
  const dict = useAppSelector(state => state.SystemContentReducer.content);

  const blockByMarker = useMemo(() => {
    const map = new Map<string, IPositionBlock>();
    if (blocks) {
      for (const block of blocks) {
        if (block.identifier) {
          map.set(block.identifier, block);
        }
      }
    }
    return map;
  }, [blocks]);

  const catalog = blockByMarker.get('home_catalog');
  const gallery = blockByMarker.get('home_gallery');
  const offers = blockByMarker.get('home_offers_feed');
  const cta = blockByMarker.get('home_discounts');
  const masters = blockByMarker.get('home_masters');

  const title = (block: IPositionBlock | undefined, fallback: string) =>
    (block?.localizeInfos?.title as string | undefined) ?? fallback;

  if (error) {
    console.warn('[HomeScreen] getBlocksByPageUrl(home) failed:', error);
  }

  if (isLoading) {
    return <FlexLoader height={550} />;
  }

  return (
    <View style={{flex: 1}}>
      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 120}}>
        {/* 1. Hero */}
        <TopHomeBanner />

        <Screen edges={['horizontal']}>
          <View style={{gap: 32, paddingTop: 24}}>
            {/* 2. Service catalog */}
            <View style={{gap: 16}}>
              <SectionTitle
                title={title(catalog, dict?.home_catalog_title ?? 'Service')}
              />
              <ServiceCardsList />
            </View>

            {/* 3. Gallery strip */}
            <View style={{gap: 16}}>
              <SectionTitle
                title={title(gallery, dict?.home_gallery_title ?? 'Gallery')}
              />
              <GalleryList />
            </View>

            {/* 4. Best offers */}
            {offers ? (
              <View style={{gap: 16}}>
                <SectionTitle
                  title={title(offers, dict?.home_offers_title ?? 'Best Offers')}
                />
                <SpecialOffersList identifier={offers.identifier} />
              </View>
            ) : null}

            {/* 5. Booking CTA banner */}
            <HomeCtaBanner block={cta} />

            {/* 6. Our specialists */}
            <View style={{gap: 16}}>
              <SectionTitle
                title={title(masters, dict?.home_masters_title ?? 'Our Specialists')}
              />
              <MastersList />
            </View>

            {/* 7. Reviews */}
            <View style={{gap: 16}}>
              <SectionTitle title={dict?.home_reviews_title ?? 'Reviews'} />
              <ReviewsCarousel />
            </View>

            <Footer height={40} />
          </View>
        </Screen>
      </ScrollView>
    </View>
  );
}
