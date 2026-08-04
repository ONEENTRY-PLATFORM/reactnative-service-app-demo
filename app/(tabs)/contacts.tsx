import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {ArrowUpRight, Clock, MapPin, Phone} from 'lucide-react-native';
import {WebView} from 'react-native-webview';
import {Screen} from '@/components/shared/Screen';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {useAppSelector} from '@/state/hooks';
import {
  formatUaePhone,
  salonFromPage,
} from '@/components/content/BookingV2/cmsUtils';

// Contacts tab — "OUR LOCATIONS" section from the web (nextjs-beauty
// components/layout/contacts-page/SalonCard.tsx): accent top strip, salon
// name, address + phone, number badge, hours pill, CALL US pink CTA and a
// VIEW STUDIO outlined pill. Same three-color cycle as the web.

// Web SALON_COLORS cycle
const SALON_COLORS = ['#ed21f1', '#109aa9', '#9b4fb2'];

export default function ContactsScreen() {
  const salonPages = useAppSelector(state => state.SalonsReducer.salons);
  const dict = useAppSelector(state => state.SystemContentReducer.content) ?? {};

  // Same drop rule as the web: a salon without an address is unusable for the
  // design and is skipped.
  const salons = salonPages
    .map((page, index) => {
      const s = salonFromPage(page);
      if (!s.address) return null;
      // Same embed URL as the web (see nextjs-beauty utils/salonMapLinks.ts):
      // Google Maps has no CMS coordinates so we build the map from the
      // address string. WebView is what renders the same iframe on mobile.
      const query = encodeURIComponent(s.address || s.name);
      return {
        ...s,
        color: SALON_COLORS[index % SALON_COLORS.length] ?? '#ed21f1',
        phoneFormatted: formatUaePhone(s.phone),
        mapSrc: `https://www.google.com/maps?q=${query}&z=15&hl=en&output=embed`,
        mapsLink: `https://www.google.com/maps/dir/?api=1&destination=${query}`,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const hoursLabel =
    (dict.salon_hours_value as string | undefined) || 'Daily 10:00–22:00';
  const callLabel = (dict.call_us_text as string | undefined) || 'Call us';
  const viewLabel =
    (dict.view_studio_text as string | undefined) || 'View studio';
  const emptyLabel =
    (dict.no_locations_text as string | undefined) ||
    'No salon locations available at the moment.';

  return (
    <Screen isFull edges={['top', 'horizontal']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 32}}>
        <View style={styles.headerBlock}>
          <Paragraph
            size={14}
            weight={'700'}
            color={'charcoal'}
            style={{
              textAlign: 'center',
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}>
            {(dict.our_locations_title as string) || 'Our Locations'}
          </Paragraph>
          <View style={styles.underline} />
        </View>

        {salons.length === 0 ? (
          <View style={{alignItems: 'center', paddingVertical: 32}}>
            <Paragraph size={13} color={'gray'}>
              {emptyLabel}
            </Paragraph>
          </View>
        ) : (
          <View style={{gap: 16, paddingHorizontal: 16}}>
            {salons.map((s, i) => (
              <View
                key={s.id}
                style={[styles.card, {borderColor: appColors.slate150}]}>
                {/* Top accent line */}
                <LinearGradient
                  colors={[s.color, `${s.color}44`]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.accentLine}
                />
                <View style={styles.info}>
                  <View style={styles.infoRow}>
                    <View style={{flex: 1, gap: 6}}>
                      <Paragraph
                        size={12}
                        weight={'700'}
                        style={{
                          color: s.color,
                          letterSpacing: 3,
                          textTransform: 'uppercase',
                        }}>
                        {s.name}
                      </Paragraph>
                      <View style={styles.line}>
                        <MapPin size={16} color={s.color} />
                        <Paragraph size={13} color={'ink'} style={{flex: 1}}>
                          {s.address}
                        </Paragraph>
                      </View>
                      {s.phoneFormatted ? (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(`tel:${s.phone}`)}
                          activeOpacity={0.7}>
                          <View style={styles.line}>
                            <Phone size={16} color={s.color} />
                            <Paragraph
                              size={13}
                              weight={'700'}
                              color={'charcoal'}>
                              {s.phoneFormatted}
                            </Paragraph>
                          </View>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    {/* Number badge */}
                    <LinearGradient
                      colors={[s.color, `${s.color}bb`]}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.badge}>
                      <Paragraph size={14} weight={'700'} color={'white'}>
                        {i + 1}
                      </Paragraph>
                    </LinearGradient>
                  </View>

                  {/* Hours pill */}
                  <View
                    style={[
                      styles.hoursPill,
                      {backgroundColor: `${s.color}1a`},
                    ]}>
                    <Clock size={14} color={s.color} />
                    <Paragraph
                      size={12}
                      weight={'700'}
                      style={{color: s.color}}>
                      {hoursLabel}
                    </Paragraph>
                  </View>
                </View>

                {/* Map — Google Maps embed via WebView so the frame matches
                    the web card 1:1. Tapping the map opens native Maps. */}
                <View style={styles.mapWrap}>
                  <WebView
                    source={{
                      html: `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,iframe{margin:0;padding:0;border:0;width:100%;height:100%;overflow:hidden;background:#e8e8f0}</style></head><body><iframe src="${s.mapSrc}" loading="lazy" allow="fullscreen"></iframe></body></html>`,
                    }}
                    style={styles.map}
                    originWhitelist={['*']}
                    javaScriptEnabled
                    domStorageEnabled
                    scrollEnabled={false}
                    mixedContentMode={'always'}
                    startInLoadingState
                    scalesPageToFit
                  />
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => Linking.openURL(s.mapsLink)}
                    style={StyleSheet.absoluteFill}
                  />
                </View>

                {/* CTA row */}
                <View style={styles.ctaRow}>
                  <TouchableOpacity
                    onPress={() =>
                      s.phone
                        ? Linking.openURL(`tel:${s.phone}`)
                        : undefined
                    }
                    activeOpacity={0.9}
                    disabled={!s.phone}
                    style={styles.callBtn}>
                    <LinearGradient
                      colors={[s.color, `${s.color}cc`]}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={StyleSheet.absoluteFill}
                    />
                    <Phone size={16} color={appColors.white} />
                    <Paragraph
                      size={13}
                      weight={'700'}
                      color={'white'}
                      style={{letterSpacing: 1, textTransform: 'uppercase'}}>
                      {callLabel}
                    </Paragraph>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => Linking.openURL(s.mapsLink)}
                    style={[styles.viewBtn, {borderColor: s.color}]}>
                    <Paragraph
                      size={13}
                      weight={'700'}
                      style={{
                        color: s.color,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                      }}>
                      {viewLabel}
                    </Paragraph>
                    <ArrowUpRight size={16} color={s.color} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  underline: {
    marginTop: 8,
    width: 40,
    height: 2,
    borderRadius: 1,
    backgroundColor: appColors.slate200,
  },
  card: {
    borderWidth: 1.5,
    borderRadius: 24,
    backgroundColor: appColors.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  accentLine: {
    height: 4,
  },
  info: {
    padding: 18,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mapWrap: {
    marginHorizontal: 14,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: appColors.slate150,
    marginBottom: 14,
  },
  map: {
    flex: 1,
    backgroundColor: appColors.slate150,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 14,
    paddingTop: 0,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: appColors.white,
  },
});
