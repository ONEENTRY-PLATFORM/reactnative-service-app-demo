import React, {memo, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Check} from 'lucide-react-native';
import {IProductsEntity} from 'oneentry/dist/products/productsInterfaces';
import {useGetBlockByMarkerQuery} from '@/api';
import {Paragraph} from '@/components/shared/Paragraph';
import FlexLoader from '@/components/shared/FlexLoader';
import {appColors} from '@/lib/constants/Colors';
import OfferBookingScreen from '@/components/content/BookingV2/OfferBookingScreen';

// Port of nextjs-beauty's OfferCard (components/layout/home/offers-feed/
// components/OfferCard.tsx). Cards read the CMS 'offer' product attributes
// (offer_description, offer_services, offer_sale, offer_price, offer_type)
// and render a discount ribbon, name, tagline, services check-list, price
// pair and Book Offer button. Featured cards (title contains "(featured)")
// get a full accent gradient instead of white with a border.

const DEFAULT_ACCENT = appColors.primaryStrong;
const CARD_WIDTH = 260;

type OfferView = {
  name: string;
  tagline: string;
  featured: boolean;
  services: string[];
  price: number;
  original: number;
  discount: number;
  accentColor: string;
};

function parseOffer(product: IProductsEntity): OfferView {
  const rawTitle = (product.localizeInfos?.title ?? '') as string;
  const featured = /\(featured\)/i.test(rawTitle);
  const name = rawTitle.replace(/\s*\(featured\)\s*/i, ' ').trim();

  const av = (product.attributeValues ?? {}) as Record<string, any>;

  const descriptionRaw = av.offer_description?.value;
  const tagline =
    typeof descriptionRaw === 'string' && descriptionRaw
      ? descriptionRaw
      : (product.localizeInfos?.plainValue as string | undefined) ?? '';

  const rawServices = av.offer_services?.value;
  const services: string[] = Array.isArray(rawServices)
    ? (rawServices
        .map((entry: any) => entry?.title)
        .filter(Boolean) as string[])
    : [];

  const price = Number(av.offer_sale?.value) || (product as any).price || 0;
  const original = Number(av.offer_price?.value) || 0;
  const discount =
    original > price && price > 0
      ? Math.round(((original - price) / original) * 100)
      : 0;

  const typeEntry: any = Array.isArray(av.offer_type?.value)
    ? av.offer_type.value[0]
    : undefined;
  const accentCandidate = [
    typeEntry?.value,
    typeEntry?.title,
    typeEntry?.extended?.value,
  ].find(
    v => typeof v === 'string' && /^#([0-9a-f]{3}){1,2}$/i.test(v as string),
  );
  const accentColor = (accentCandidate as string) || DEFAULT_ACCENT;

  return {name, tagline, featured, services, price, original, discount, accentColor};
}

const OfferCard = ({product}: {product: IProductsEntity}) => {
  const view = parseOffer(product);
  const [bookOpen, setBookOpen] = useState(false);
  const onBook = () => setBookOpen(true);

  const textColor = view.featured ? appColors.white : appColors.charcoal;
  const mutedColor = view.featured ? 'rgba(255,255,255,0.75)' : appColors.ink;
  const dividerColor = view.featured ? 'rgba(255,255,255,0.18)' : appColors.slate150;

  const inner = (
    // Layout is a flex column with three regions: header (fixed), services
    // (flex, absorbs varying service count) and footer (fixed). This keeps
    // the price + Book button on the same horizontal line across cards no
    // matter how many services each offer bundles.
    <View style={{flex: 1, padding: 16, justifyContent: 'space-between'}}>
      {/* Header */}
      <View style={{paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: dividerColor}}>
        {view.discount > 0 ? (
          <View style={{alignSelf: 'flex-end', marginBottom: 8}}>
            <View
              style={[
                styles.discountBadge,
                {
                  backgroundColor: view.featured
                    ? 'rgba(255,255,255,0.22)'
                    : view.accentColor,
                },
              ]}>
              <Paragraph color={'white'} size={12} weight={'700'}>
                -{view.discount}%
              </Paragraph>
            </View>
          </View>
        ) : null}
        <Paragraph
          family={'league-gothic'}
          color={view.featured ? 'white' : 'charcoal'}
          size={26}
          style={{textTransform: 'uppercase', lineHeight: 28}}
          numberOfLines={2}>
          {view.name}
        </Paragraph>
        {view.tagline ? (
          <Paragraph
            size={12}
            style={{color: mutedColor, marginTop: 4}}
            numberOfLines={2}>
            {view.tagline}
          </Paragraph>
        ) : null}
      </View>

      {/* Services (variable size — grows/shrinks to keep the footer pinned) */}
      <View style={{flex: 1, paddingVertical: 12, gap: 8, justifyContent: 'flex-start'}}>
        {view.services.slice(0, 4).map(s => (
          <View key={s} style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <View
              style={[
                styles.checkBubble,
                {
                  backgroundColor: view.featured
                    ? 'rgba(255,255,255,0.25)'
                    : view.accentColor + '22',
                },
              ]}>
              <Check
                size={12}
                color={view.featured ? appColors.white : view.accentColor}
                strokeWidth={3}
              />
            </View>
            <Paragraph
              size={12}
              style={{color: textColor, flex: 1}}
              numberOfLines={1}>
              {s}
            </Paragraph>
          </View>
        ))}
      </View>

      {/* Footer — pinned to the bottom of the card */}
      <View style={{gap: 8, paddingTop: 12}}>
        {view.price > 0 ? (
          <View style={{flexDirection: 'row', alignItems: 'baseline', gap: 8}}>
            <Paragraph
              family={'league-gothic'}
              size={26}
              style={{color: textColor}}>
              {view.price}
            </Paragraph>
            <Paragraph size={12} style={{color: mutedColor}}>
              AED
            </Paragraph>
            {view.original > 0 ? (
              <Paragraph
                size={12}
                style={{
                  color: mutedColor,
                  textDecorationLine: 'line-through',
                }}>
                {view.original}
              </Paragraph>
            ) : null}
          </View>
        ) : null}
        <TouchableOpacity
          onPress={onBook}
          activeOpacity={0.85}
          style={[
            styles.bookBtn,
            view.featured
              ? {backgroundColor: appColors.white}
              : {backgroundColor: view.accentColor},
          ]}>
          <Paragraph
            size={12}
            weight={'700'}
            color={view.featured ? 'primary' : 'white'}
            style={{textTransform: 'uppercase', letterSpacing: 0.3}}>
            Book Offer
          </Paragraph>
        </TouchableOpacity>
      </View>
    </View>
  );

  const cardStyle = [
    styles.card,
    view.featured
      ? {shadowColor: view.accentColor, shadowOpacity: 0.25}
      : {
          backgroundColor: appColors.white,
          borderWidth: 1,
          borderColor: appColors.slate150,
          shadowColor: '#000',
          shadowOpacity: 0.07,
        },
  ];

  if (view.featured) {
    return (
      <>
        <View style={cardStyle}>
          <LinearGradient
            colors={[view.accentColor, view.accentColor + 'cc']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
          />
          {inner}
        </View>
        <OfferBookingScreen
          visible={bookOpen}
          onClose={() => setBookOpen(false)}
          offer={product}
          accentColor={view.accentColor}
          accentLight={view.accentColor + 'cc'}
        />
      </>
    );
  }

  return (
    <>
      <View style={cardStyle}>{inner}</View>
      <OfferBookingScreen
        visible={bookOpen}
        onClose={() => setBookOpen(false)}
        offer={product}
        accentColor={view.accentColor}
        accentLight={view.accentColor + 'cc'}
      />
    </>
  );
};

type Props = {
  identifier: string;
};

const SpecialOffersList: React.FC<Props> = ({identifier}) => {
  const {data: block, isLoading, error} = useGetBlockByMarkerQuery({
    marker: identifier,
    limit: 10,
  });
  const products = (block as any)?.similarProducts?.items ?? [];

  if (isLoading) return <FlexLoader height={196} />;
  if (error) {
    console.warn('[SpecialOffersList] getBlockByMarker failed:', error);
    return null;
  }
  if (products.length === 0) return null;

  return (
    <FlatList
      horizontal
      data={products}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{gap: 14, paddingRight: 8}}
      keyExtractor={item => String(item.id)}
      renderItem={({item}) => <OfferCard product={item} />}
    />
  );
};

// Fixed card height so every price row / Book button lines up across
// horizontally-scrolled cards regardless of service count / tagline length.
const CARD_HEIGHT = 380;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  discountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  checkBubble: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtn: {
    marginTop: 10,
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: 'center',
  },
});

export default memo(SpecialOffersList);
