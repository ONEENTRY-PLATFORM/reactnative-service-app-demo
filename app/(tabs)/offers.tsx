import {ScrollView, StyleSheet, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {IProductsEntity} from 'oneentry/dist/products/productsInterfaces';
import {Screen} from '@/components/shared/Screen';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {useGetProductsByPageUrlQuery} from '@/api';
import {useAppSelector} from '@/state/hooks';
import EmptyState from '@/components/shared/EmptyState';
import FlexLoader from '@/components/shared/FlexLoader';
import OfferDetailCard from '@/components/content/OffersScreen/OfferDetailCard';

// /offers port of nextjs-beauty. Web layout in the same order:
//   1. Fuchsia gradient accent strip at the very top
//   2. Underlined heading ("Special Offers")
//   3. Full-width OfferDetailCard for each offer product
//   4. "Good to know" terms block (same 4 bullets as web)
//
// Offer products live under /pages/offers and carry attributeSetIdentifier
// 'offer' (see components/utils/isOfferProduct on web).
const OFFER_TERMS: string[] = [
  'Valid through the end of the current month.',
  'Cannot be combined with other promotions or loyalty discounts.',
  'Subject to specialist availability — book ahead for weekends.',
  'Full package must be redeemed in a single visit.',
];

const isOfferProduct = (product: IProductsEntity): boolean =>
  product.attributeSetIdentifier === 'offer';

export default function OffersScreen() {
  const dict = useAppSelector(state => state.SystemContentReducer.content);

  const {data, isLoading} = useGetProductsByPageUrlQuery({pageUrl: 'offers'});
  const allProducts = ((data as IProductsEntity[]) ?? []) as IProductsEntity[];
  const offers = allProducts.filter(isOfferProduct);
  // Some CMS configs skip the attribute set marker — fall back to everything
  // on the page so we don't show an empty screen while offers are being set up.
  const list = offers.length > 0 ? offers : allProducts;

  // Web renders just 'Offers' as the heading (see components/layout/offers-
  // page/index.tsx). CMS `offers` page title is 'Offers' too — keep parity.
  const title = (dict?.offers_title as string | undefined) ?? 'Offers';
  const emptyText =
    (dict?.no_offers_text as string | undefined) ??
    'No special offers available right now — check back soon.';
  const goodToKnow =
    (dict?.offer_good_to_know_text as string | undefined) ?? 'Good to know';

  return (
    <View style={{flex: 1, backgroundColor: appColors.white}}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 120}}>
        {/* 1. Fuchsia gradient strip */}
        <LinearGradient
          colors={[appColors.primary, appColors.cyanAccent]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.accentStrip}
        />

        <Screen edges={['horizontal']}>
          {/* 2. Heading */}
          <View style={{alignItems: 'center', paddingVertical: 24}}>
            <View style={styles.headingUnderline}>
              <Paragraph
                family={'league-gothic'}
                color={'ink'}
                size={30}
                style={{
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: 3,
                }}>
                {title}
              </Paragraph>
            </View>
          </View>

          {/* 3. Cards */}
          {isLoading ? (
            <FlexLoader height={240} />
          ) : list.length > 0 ? (
            <View style={{gap: 20, marginBottom: 24}}>
              {list.map(offer => (
                <OfferDetailCard key={offer.id} product={offer} />
              ))}
            </View>
          ) : (
            <EmptyState compact title={'No offers'} description={emptyText} />
          )}

          {/* 4. Good to know */}
          <View style={styles.termsCard}>
            <Paragraph
              color={'ink'}
              size={11}
              weight={'700'}
              style={{
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginBottom: 12,
              }}>
              {goodToKnow}
            </Paragraph>
            <View style={{gap: 8}}>
              {OFFER_TERMS.map(t => (
                <View
                  key={t}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}>
                  <View style={styles.termDot} />
                  <Paragraph
                    size={13}
                    style={{color: appColors.ink, flex: 1, lineHeight: 19}}>
                    {t}
                  </Paragraph>
                </View>
              ))}
            </View>
          </View>
        </Screen>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  accentStrip: {
    height: 5,
  },
  headingUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: appColors.ink,
    paddingBottom: 6,
    paddingHorizontal: 4,
  },
  termsCard: {
    marginTop: 12,
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#f7f7fb',
  },
  termDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: appColors.primary,
    marginTop: 8,
  },
});
