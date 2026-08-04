import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Clock} from 'lucide-react-native';
import {router} from 'expo-router';
import {IProductsEntity} from 'oneentry/dist/products/productsInterfaces';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {selectServiceForOrder} from '@/state/reducers/OrderSlice';

// Single service card, mirroring nextjs-beauty's ServiceCard on /services.
// Layout: title + description on the left, price on the right; footer row
// with duration (Clock icon) on the left and a BOOK button pinned to the
// bottom-right. Card degrades to 'Not available' badge when the product has
// no price.
const ServiceCard = ({service}: {service: IProductsEntity}) => {
  const dispatch = useAppDispatch();
  const dict = useAppSelector(state => state.SystemContentReducer.content);
  const attrs = (service?.attributeValues ?? {}) as Record<string, any>;

  const attrPrice = attrs.price?.value;
  const price =
    typeof (service as any).price === 'number'
      ? (service as any).price
      : typeof attrPrice === 'number'
        ? attrPrice
        : null;

  const currency =
    (typeof attrs.currency?.value === 'string'
      ? attrs.currency.value
      : 'AED') || 'AED';

  const durationRaw = attrs.duration?.value ?? attrs.time?.value;
  const duration =
    typeof durationRaw === 'number'
      ? durationRaw
      : typeof durationRaw === 'string'
        ? Number(durationRaw) || null
        : null;

  const description = (() => {
    const raw = attrs.description?.value;
    if (typeof raw === 'string') return raw;
    if (Array.isArray(raw)) {
      const first = raw[0];
      return (first?.plainValue as string | undefined) ?? '';
    }
    return '';
  })();

  const unavailable = price === null;

  const onBook = () => {
    dispatch(selectServiceForOrder(service));
    router.navigate('/(tabs)/booking');
  };

  return (
    <View
      style={[styles.card, unavailable && {opacity: 0.65}]}>
      <View style={styles.header}>
        <View style={{flex: 1, minWidth: 0}}>
          <Paragraph
            color={'charcoal'}
            size={15}
            weight={'700'}
            numberOfLines={2}>
            {service.localizeInfos?.title as string}
          </Paragraph>
          {description ? (
            <Paragraph
              color={'ink'}
              size={12}
              numberOfLines={2}
              style={{marginTop: 4}}>
              {description}
            </Paragraph>
          ) : null}
        </View>
        <View style={styles.priceCol}>
          {unavailable ? (
            <View style={styles.notAvailable}>
              <Paragraph
                size={10}
                weight={'700'}
                style={{
                  color: appColors.gray,
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                }}>
                {dict?.not_available_text ?? 'Not available'}
              </Paragraph>
            </View>
          ) : (
            <View style={{flexDirection: 'row', alignItems: 'baseline', gap: 4}}>
              <Paragraph
                family={'league-gothic'}
                size={24}
                style={{color: appColors.charcoal}}>
                {price}
              </Paragraph>
              <Paragraph size={11} style={{color: appColors.ink}}>
                {currency}
              </Paragraph>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        {duration !== null ? (
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <Clock size={14} color={appColors.ink} />
            <Paragraph size={12} style={{color: appColors.ink}}>
              {duration} {dict?.min_text ?? 'min'}
            </Paragraph>
          </View>
        ) : (
          <View />
        )}
        <TouchableOpacity
          onPress={onBook}
          disabled={unavailable}
          activeOpacity={0.85}
          style={[
            styles.bookBtn,
            unavailable
              ? {borderColor: appColors.slate200, backgroundColor: appColors.slate150}
              : {borderColor: appColors.primary, backgroundColor: appColors.primary + '10'},
          ]}>
          <Paragraph
            color={unavailable ? 'gray' : 'primary'}
            size={12}
            weight={'700'}
            style={{textTransform: 'uppercase', letterSpacing: 0.4}}>
            {dict?.book_short_text ?? 'Book'}
          </Paragraph>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: appColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: appColors.slate150,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  priceCol: {
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  notAvailable: {
    backgroundColor: appColors.slate150,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: appColors.slate150,
  },
  bookBtn: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
});

export default ServiceCard;
