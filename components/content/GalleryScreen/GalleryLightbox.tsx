import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  type ScrollViewInstance,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Image as ExpoImage} from 'expo-image';
import {ChevronLeft, ChevronRight, Share2, X} from 'lucide-react-native';
import {Carousel, CarouselRef} from 'react-native-reanimated-carousel';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';

// Mobile port of nextjs-beauty GalleryLightbox
// (components/layout/gallery-page/components/GalleryLightbox.tsx).
// Layout, top → bottom:
//   1. Counter "N/Total" (top-left) + close X (top-right)
//   2. Full-width photo stage with left/right chevron buttons
//   3. Caption row: title (category) + "master · role" (role in accent pink)
//   4. Horizontal thumbnail strip, current thumb highlighted

export type LightboxPhoto = {
  id: string;
  downloadLink: string;
  master: string;
  title: string;
  role: string;
};

interface Props {
  visible: boolean;
  onClose: () => void;
  items: LightboxPhoto[];
  defaultIndex: number;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const STAGE_HORIZONTAL_PAD = 16;
const STAGE_WIDTH = SCREEN_WIDTH - STAGE_HORIZONTAL_PAD * 2;
const STAGE_HEIGHT = Math.round(STAGE_WIDTH * 1.25);
const THUMB_SIZE = 46;
const THUMB_GAP = 8;

const GalleryLightbox: React.FC<Props> = ({
  visible,
  onClose,
  items,
  defaultIndex,
}) => {
  const insets = useSafeAreaInsets();
  const carouselRef = useRef<CarouselRef | null>(null);
  const thumbsRef = useRef<ScrollViewInstance | null>(null);
  const [index, setIndex] = useState(defaultIndex);

  useEffect(() => {
    if (visible) setIndex(defaultIndex);
  }, [visible, defaultIndex]);

  // Keep the thumbnail strip centered on the active photo.
  useEffect(() => {
    if (!thumbsRef.current) return;
    const step = THUMB_SIZE + THUMB_GAP;
    const target = index * step - (SCREEN_WIDTH - THUMB_SIZE) / 2;
    thumbsRef.current.scrollTo({
      x: Math.max(0, target),
      animated: true,
    });
  }, [index]);

  const item = items[index];
  const canPrev = index > 0;
  const canNext = index < items.length - 1;

  const goPrev = () => {
    if (!canPrev) return;
    carouselRef.current?.scrollTo({index: index - 1, animated: true});
  };
  const goNext = () => {
    if (!canNext) return;
    carouselRef.current?.scrollTo({index: index + 1, animated: true});
  };
  const jumpTo = (i: number) => {
    carouselRef.current?.scrollTo({index: i, animated: true});
    setIndex(i);
  };

  if (items.length === 0 || !item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={'fade'}
      onRequestClose={onClose}
      statusBarTranslucent>
      <StatusBar barStyle={'light-content'} />
      <View
        style={[
          styles.backdrop,
          {paddingBottom: Math.max(insets.bottom, 12)},
        ]}>
        {/* Top bar: counter + close — pad by the notch inset so the buttons
            stay clear of the status bar / dynamic island. */}
        <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
          <View style={styles.counterPill}>
            <Paragraph size={12} weight={'700'} color={'white'}>
              {index + 1}/{items.length}
            </Paragraph>
          </View>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={styles.closeBtn}>
            <X size={18} color={appColors.white} />
          </TouchableOpacity>
        </View>

        {/* Stage with side arrows */}
        <View style={styles.stageWrap}>
          <Carousel
            ref={carouselRef as React.Ref<CarouselRef>}
            loop={false}
            autoplay={false}
            itemSize={STAGE_WIDTH}
            data={items}
            defaultIndex={defaultIndex}
            onSnapToItem={setIndex}
            style={{width: STAGE_WIDTH, height: STAGE_HEIGHT}}
            renderItem={({item: photo}: {item: LightboxPhoto}) => (
              <ExpoImage
                source={{uri: photo.downloadLink}}
                style={styles.stageImage}
                contentFit={'cover'}
                transition={200}
              />
            )}
          />
          {canPrev ? (
            <TouchableOpacity
              onPress={goPrev}
              activeOpacity={0.85}
              style={[styles.sideArrow, styles.sideArrowLeft]}>
              <ChevronLeft size={22} color={appColors.white} />
            </TouchableOpacity>
          ) : null}
          {canNext ? (
            <TouchableOpacity
              onPress={goNext}
              activeOpacity={0.85}
              style={[styles.sideArrow, styles.sideArrowRight]}>
              <ChevronRight size={22} color={appColors.white} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Caption */}
        <View style={styles.captionRow}>
          <View style={{flex: 1}}>
            <Paragraph size={18} weight={'700'} color={'white'}>
              {item.title}
            </Paragraph>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 2}}>
              {item.master ? (
                <Paragraph size={13} style={{color: 'rgba(255,255,255,0.72)'}}>
                  {item.master}
                </Paragraph>
              ) : null}
              {item.role ? (
                <Paragraph
                  size={13}
                  weight={'700'}
                  style={{color: appColors.primary}}>
                  {item.master ? ' · ' : ''}
                  {item.role}
                </Paragraph>
              ) : null}
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.shareBtn}>
            <Share2 size={14} color={appColors.white} />
          </TouchableOpacity>
        </View>

        {/* Thumbnail strip */}
        <ScrollView
          ref={thumbsRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbsRow}>
          {items.map((photo, i) => {
            const active = i === index;
            return (
              <TouchableOpacity
                key={photo.id}
                onPress={() => jumpTo(i)}
                activeOpacity={0.85}
                style={[styles.thumb, active && styles.thumbActive]}>
                <ExpoImage
                  source={{uri: photo.downloadLink}}
                  style={StyleSheet.absoluteFill}
                  contentFit={'cover'}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,0,14,0.96)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: STAGE_HORIZONTAL_PAD,
    paddingTop: 8,
    paddingBottom: 10,
  },
  counterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  stageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 12,
    height: STAGE_HEIGHT,
    position: 'relative',
  },
  stageImage: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    borderRadius: 18,
  },
  sideArrow: {
    position: 'absolute',
    top: STAGE_HEIGHT / 2 - 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  sideArrowLeft: {left: STAGE_HORIZONTAL_PAD + 6},
  sideArrowRight: {right: STAGE_HORIZONTAL_PAD + 6},
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: STAGE_HORIZONTAL_PAD + 4,
    marginBottom: 14,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  thumbsRow: {
    gap: THUMB_GAP,
    paddingHorizontal: STAGE_HORIZONTAL_PAD,
    paddingBottom: 12,
    alignItems: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    opacity: 0.55,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  thumbActive: {
    opacity: 1,
    borderColor: appColors.primary,
  },
});

export default GalleryLightbox;
