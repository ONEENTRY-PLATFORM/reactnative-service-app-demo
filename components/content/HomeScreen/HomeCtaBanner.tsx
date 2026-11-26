import {ImageBackground, StyleSheet, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {router} from 'expo-router';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {attrFileUrl} from '@/lib/oneentry/attributes';
import type {IPositionBlock} from 'oneentry/dist/pages/pagesInterfaces';

// Booking CTA banner, mirroring nextjs-beauty's HomeCtaBanner. The web
// reads image + copy from the `home_discounts` block; here we do the same
// but fall back to the design-system gradient + defaults so the section
// stays populated even before CMS content is filled.
type Props = {
  block?: IPositionBlock | undefined;
};

const HomeCtaBanner = ({block}: Props) => {
  const attrs = (block?.attributeValues ?? {}) as Record<string, any>;
  const bg =
    attrFileUrl(attrs.bg_image_mobile) ?? attrFileUrl(attrs.bg_image);
  const title = attrs.title?.value ?? 'Ready to visit?';
  const description =
    attrs.description?.value ??
    'Book your next appointment and get a warm welcome from our specialists.';
  const cta = attrs.cta?.value ?? 'Book now';

  const Inner = (
    <View style={styles.overlay}>
      <Paragraph
        family={'league-gothic'}
        color={'white'}
        size={32}
        style={{textAlign: 'center', textTransform: 'uppercase'}}>
        {title}
      </Paragraph>
      <Paragraph
        color={'white'}
        size={13}
        style={{textAlign: 'center', marginTop: 8, opacity: 0.9}}
        numberOfLines={2}>
        {description}
      </Paragraph>
      <TouchableOpacity
        onPress={() => router.navigate('/(tabs)/booking')}
        activeOpacity={0.85}
        style={styles.cta}>
        <Paragraph
          color={'primary'}
          size={13}
          weight={'700'}
          style={{textTransform: 'uppercase'}}>
          {cta}
        </Paragraph>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.card}>
      {bg ? (
        <ImageBackground source={{uri: bg}} style={styles.bg} resizeMode={'cover'}>
          <LinearGradient
            colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFill}
          />
          {Inner}
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={[appColors.primary, appColors.purpleAccent]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.bg}>
          {Inner}
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    minHeight: 200,
  },
  bg: {
    flex: 1,
    minHeight: 200,
    justifyContent: 'center',
  },
  overlay: {
    padding: 24,
    alignItems: 'center',
  },
  cta: {
    marginTop: 16,
    backgroundColor: appColors.white,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 22,
  },
});

export default HomeCtaBanner;
