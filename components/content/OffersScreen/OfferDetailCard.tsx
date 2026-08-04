import React, {useState} from 'react';
import {Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Image as ExpoImage} from 'expo-image';
import {LinearGradient} from 'expo-linear-gradient';
import {ChevronRight, Check, Clock} from 'lucide-react-native';
import {IProductsEntity} from 'oneentry/dist/products/productsInterfaces';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {useAppSelector} from '@/state/hooks';
import OfferBookingScreen from '@/components/content/BookingV2/OfferBookingScreen';

// Full-width special-offer card, mirroring nextjs-beauty OfferDetailCard.
// Layout: photo top (media), accent-gradient panel bottom. Discount / duration
// / price are absolute overlays on top of the media, so they render even when
// the CMS hasn't attached an image yet.
//
// Attribute map (verified live on beauty.oneentry.cloud):
//   offer_image        — hero photo (array of files)
//   offer_description  — description text
//   offer_services     — bundled service entity links
//   offer_sale         — current price (string number)
//   offer_price        — original crossed-out price
//   offer_time         — duration string, e.g. "2 hours"
//   offer_type[0]      — { title: 'Body'|'Face'|'Hair'|'Nails', value: {...} }
//   currency           — 'AED'

// Per-category accent fallback matching web offerCategoryAccentsData.ts.
// offer_type currently carries a category entity (Hair/Face/Body/Nails)
// rather than a hex, so map by title first.
const CATEGORY_ACCENTS: Record<string, string> = {
  Hair: '#ed21f1',
  Face: '#9b4fb2',
  Body: '#109aa9',
  Nails: '#109aa9',
};
const ACCENT_GRAD_LIGHT: Record<string, string> = {
  '#109aa9': '#26d2e6',
  '#ed21f1': '#f60efb',
  '#9b4fb2': '#7e63ae',
};

type OfferView = {
  name: string;
  description: string;
  services: string[];
  price: number;
  original: number;
  discount: number;
  accentColor: string;
  accentLight: string;
  image?: string;
  duration?: string;
  currency: string;
};

function parseOffer(product: IProductsEntity): OfferView {
  const av = (product.attributeValues ?? {}) as Record<string, any>;
  const rawTitle = (product.localizeInfos?.title ?? '') as string;
  const name = rawTitle.replace(/\s*\(featured\)\s*/i, ' ').trim();

  const descriptionRaw = av.offer_description?.value;
  const description =
    typeof descriptionRaw === 'string' && descriptionRaw
      ? descriptionRaw
      : (product.localizeInfos?.plainValue as string | undefined) ?? '';

  const rawServices = av.offer_services?.value;
  const services: string[] = Array.isArray(rawServices)
    ? (rawServices.map((v: any) => v?.title).filter(Boolean) as string[])
    : [];

  const price = Number(av.offer_sale?.value) || (product as any).price || 0;
  const original = Number(av.offer_price?.value) || 0;
  const discount =
    original > price && price > 0
      ? Math.round(((original - price) / original) * 100)
      : 0;

  // offer_type currently stores a category entity; grab title to look up hex.
  const typeEntry: any = Array.isArray(av.offer_type?.value)
    ? av.offer_type.value[0]
    : undefined;
  const explicitHex = [
    typeEntry?.extended?.value,
    typeEntry?.value,
    typeEntry?.title,
  ].find(
    v => typeof v === 'string' && /^#([0-9a-f]{3}){1,2}$/i.test(v as string),
  ) as string | undefined;
  const accentColor =
    explicitHex ||
    (typeof typeEntry?.title === 'string'
      ? CATEGORY_ACCENTS[typeEntry.title]
      : undefined) ||
    appColors.primaryStrong;
  const accentLight = ACCENT_GRAD_LIGHT[accentColor.toLowerCase()] ?? accentColor;

  // `offer_image.value` can be either a single file object or an array of them —
  // both shapes appear in the CMS. Mirror the web parseOfferDetail behaviour.
  const imageVal = av.offer_image?.value as any;
  const imageFile = Array.isArray(imageVal) ? imageVal[0] : imageVal;
  const image =
    (typeof imageFile?.downloadLink === 'string' && imageFile.downloadLink) ||
    ((product as any)?.pictures?.[0]?.downloadLink as string | undefined) ||
    undefined;

  const duration =
    typeof av.offer_time?.value === 'string' && av.offer_time.value.trim()
      ? av.offer_time.value.trim()
      : undefined;

  const currency =
    typeof av.currency?.value === 'string' ? av.currency.value : 'AED';

  return {
    name,
    description,
    services,
    price,
    original,
    discount,
    accentColor,
    accentLight,
    image,
    duration,
    currency,
  };
}

const MediaOverlays = ({v}: {v: OfferView}) => (
  <>
    {/* Dark gradient veil so overlay text stays readable regardless of the
        underlying photo. */}
    <LinearGradient
      colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
      style={StyleSheet.absoluteFill}
      pointerEvents={'none'}
    />
    {/* Duration pill top-right */}
    {v.duration ? (
      <View style={[styles.durationPill, {borderColor: v.accentColor}]}>
        <Clock size={14} color={appColors.white} />
        <Paragraph color={'white'} size={12} weight={'700'}>
          {v.duration}
        </Paragraph>
      </View>
    ) : null}
    {/* Discount badge top-left */}
    {v.discount > 0 ? (
      <View style={[styles.discountBadge, {backgroundColor: v.accentColor}]}>
        <Paragraph color={'white'} size={14} weight={'700'}>
          -{v.discount}%
        </Paragraph>
      </View>
    ) : null}
    {/* Price overlay bottom-left */}
    {v.price > 0 ? (
      <View style={styles.priceOverlay}>
        <Paragraph
          family={'league-gothic'}
          color={'white'}
          size={40}
          style={{letterSpacing: 0.5, lineHeight: 42}}>
          {v.price}
        </Paragraph>
        <View style={{gap: 2}}>
          <Paragraph color={'white'} size={12}>
            {v.currency}
          </Paragraph>
          {v.original > 0 ? (
            <Paragraph
              color={'white'}
              size={11}
              style={{
                textDecorationLine: 'line-through',
                opacity: 0.7,
              }}>
              {v.original}
            </Paragraph>
          ) : null}
        </View>
      </View>
    ) : null}
  </>
);

const OfferDetailCard = ({product}: {product: IProductsEntity}) => {
  const dict = useAppSelector(state => state.SystemContentReducer.content);
  const v = parseOffer(product);
  const [bookOpen, setBookOpen] = useState(false);

  const onBook = () => setBookOpen(true);

  return (
    <View style={[styles.card, {shadowColor: v.accentColor}]}>
      {/* Media — gradient base always, photo on top when present (expo-image
          is more forgiving than <ImageBackground> on RN with cached HTTPS
          URLs), overlays layered above both. */}
      <View style={styles.media}>
        <LinearGradient
          colors={[v.accentLight, v.accentColor]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={StyleSheet.absoluteFill}
        />
        {v.image ? (
          <ExpoImage
            source={{uri: v.image}}
            style={StyleSheet.absoluteFill}
            contentFit={'cover'}
            transition={200}
          />
        ) : null}
        <MediaOverlays v={v} />
      </View>

      {/* Accent panel */}
      <LinearGradient
        colors={[v.accentLight, v.accentColor]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.panel}>
        <Paragraph
          family={'league-gothic'}
          color={'white'}
          size={30}
          style={{textTransform: 'uppercase', letterSpacing: 0.5}}>
          {v.name}
        </Paragraph>
        {v.description ? (
          <Paragraph
            color={'white'}
            size={13}
            style={{marginTop: 6, opacity: 0.92, lineHeight: 19}}>
            {v.description}
          </Paragraph>
        ) : null}

        {v.services.length > 0 ? (
          <View style={{marginTop: 16, gap: 8}}>
            <Paragraph
              color={'white'}
              size={11}
              weight={'700'}
              style={{
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                opacity: 0.85,
              }}>
              {dict?.offer_included_text ?? "What's included"}
            </Paragraph>
            {v.services.map(s => (
              <View
                key={s}
                style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <View style={styles.checkBubble}>
                  <Check size={12} color={appColors.white} strokeWidth={3} />
                </View>
                <Paragraph color={'white'} size={13} style={{flex: 1}}>
                  {s}
                </Paragraph>
              </View>
            ))}
          </View>
        ) : null}

        <TouchableOpacity
          onPress={onBook}
          activeOpacity={0.85}
          style={styles.bookBtn}>
          <Paragraph
            color={'white'}
            size={13}
            weight={'700'}
            style={{textTransform: 'uppercase', letterSpacing: 0.5}}>
            {dict?.book_offer_text ?? 'Book Offer'}
          </Paragraph>
          <ChevronRight size={15} color={appColors.white} />
        </TouchableOpacity>
      </LinearGradient>

      <OfferBookingScreen
        visible={bookOpen}
        onClose={() => setBookOpen(false)}
        offer={product}
        accentColor={v.accentColor}
        accentLight={v.accentLight}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0.2,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 12},
    elevation: 5,
    backgroundColor: appColors.white,
  },
  media: {
    height: 220,
    backgroundColor: appColors.slate150,
    position: 'relative',
    overflow: 'hidden',
  },
  durationPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  discountBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  priceOverlay: {
    position: 'absolute',
    left: 16,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  panel: {
    padding: 20,
  },
  checkBubble: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  bookBtn: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 14,
  },
});

export default OfferDetailCard;
