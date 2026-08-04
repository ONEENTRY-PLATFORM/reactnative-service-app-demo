import React, {useMemo, useRef} from 'react';
import {
  Dimensions,
  ImageBackground,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Carousel, CarouselRef} from 'react-native-reanimated-carousel';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {useGetSlidesQuery} from '@/api';

// Hero carousel on the home page. Data comes from Blocks.getSlides('home_hero')
// (the block is of type slider_block, its own attributeValues is empty; each
// slide carries the payload). Slide shape from live API:
//   image_id1  — main background image (array of files)
//   image_id2  — decorative accent image (array of files)
//   string_id3 — headline ("Enchanting gaze")
//   string_id4 — subhead ("Lash Lift & Tint + …")
//   string_id5 — badge (e.g. "-15 %")
//   string_id6 — CTA label ("Discover more")
//   string_id7 — CTA link (URL or "#")
// NOTE: slide fields are NOT wrapped in {value, type} the way regular
// attributeValues on pages/products are — image_id1 is directly a file array,
// string_id3 is directly a string. SDK normalization only strips the langCode
// wrapper.

type SlideFile = {downloadLink?: string};
type SlideAttributes = {
  image_id1?: SlideFile[];
  image_id2?: SlideFile[];
  string_id3?: string;
  string_id4?: string;
  string_id5?: string;
  string_id6?: string;
  string_id7?: string;
};

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const SLIDE_HEIGHT = 380;

const HeroSlide = ({slide}: {slide: SlideAttributes}) => {
  const bg = slide.image_id1?.[0]?.downloadLink;
  const headline = slide.string_id3 ?? '';
  const subhead = slide.string_id4 ?? '';
  const badge = slide.string_id5;
  const cta = slide.string_id6;
  const href = slide.string_id7;

  const onPress = () => {
    if (href && href !== '#') {
      Linking.openURL(href).catch(() => undefined);
    }
  };

  return (
    <View style={styles.slide}>
      {bg ? (
        <ImageBackground source={{uri: bg}} style={styles.bg} resizeMode={'cover'}>
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.content}>
            {badge ? (
              <View style={styles.badge}>
                <Paragraph
                  family={'league-gothic'}
                  color={'white'}
                  size={22}
                  style={{letterSpacing: 0.5}}>
                  {badge}
                </Paragraph>
              </View>
            ) : null}
            <Paragraph
              family={'league-gothic'}
              color={'white'}
              size={40}
              style={{textTransform: 'uppercase', lineHeight: 42}}>
              {headline}
            </Paragraph>
            {subhead ? (
              <Paragraph
                color={'white'}
                size={13}
                style={{marginTop: 6, opacity: 0.9}}
                numberOfLines={2}>
                {subhead}
              </Paragraph>
            ) : null}
            {cta ? (
              <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                style={styles.cta}>
                <Paragraph
                  color={'primary'}
                  size={13}
                  weight={'700'}
                  style={{textTransform: 'uppercase'}}>
                  {cta}
                </Paragraph>
              </TouchableOpacity>
            ) : null}
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.bg, {backgroundColor: appColors.primary}]} />
      )}
    </View>
  );
};

const TopHomeBanner = () => {
  const {data, isLoading} = useGetSlidesQuery({marker: 'home_hero'});
  const ref = useRef<CarouselRef | null>(null);

  const slides = useMemo<SlideAttributes[]>(() => {
    // SDK normalizes attributeValues[langCode] → attributeValues, so item
    // fields are directly readable.
    return ((data as any)?.items ?? []).map(
      (item: any) => (item?.attributeValues ?? {}) as SlideAttributes,
    );
  }, [data]);

  if (isLoading || slides.length === 0) {
    return (
      <View
        style={{
          height: SLIDE_HEIGHT,
          backgroundColor: appColors.slate150,
        }}
      />
    );
  }

  return (
    // No safe-area top offset here — the tab header already renders under
    // the notch and provides its own padding. Adding another `top` inset
    // would leave a visible gap between the header and the hero image.
    <View>
      <Carousel
        ref={ref as React.Ref<CarouselRef>}
        loop={slides.length > 1}
        autoplay={slides.length > 1}
        autoplayInterval={5000}
        itemSize={SCREEN_WIDTH}
        style={{width: SCREEN_WIDTH, height: SLIDE_HEIGHT}}
        data={slides}
        renderItem={({item}: {item: SlideAttributes}) => (
          <HeroSlide slide={item} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    width: SCREEN_WIDTH,
    height: SLIDE_HEIGHT,
  },
  bg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    padding: 20,
    paddingBottom: 28,
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: appColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: appColors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
  },
});

export default TopHomeBanner;
