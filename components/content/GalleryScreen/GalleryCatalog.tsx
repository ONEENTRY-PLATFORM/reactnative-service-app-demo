import React, {useCallback, useMemo, useState} from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Image as ExpoImage} from 'expo-image';
import {LinearGradient} from 'expo-linear-gradient';
import {Search, X} from 'lucide-react-native';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';
import {useGetChildPagesByUrlQuery} from '@/api';
import {Paragraph} from '@/components/shared/Paragraph';
import FlexLoader from '@/components/shared/FlexLoader';
import GalleryLightbox, {
  LightboxPhoto,
} from '@/components/content/GalleryScreen/GalleryLightbox';
import {appColors} from '@/lib/constants/Colors';
import {useAppSelector} from '@/state/hooks';

// Full port of nextjs-beauty /gallery (mobile web layout):
//   1. Service | Specialist tabs
//   2. Main-category pills (Hair / Face / Body / Nails)
//   3. Specialist chip row (only on the Specialist tab)
//   4. Search input
//   5. "N photos" counter
//   6. 2-column full-bleed photo grid → CollectionSliderModal lightbox
//
// The CMS gallery tree is:
//   /gallery
//     /gallery-hair  ─ photo pages (gallery_photos[], master_id[0])
//     /gallery-face
//     /gallery-body
//     /gallery-nails
// Photos are tagged at the main-category level only, so no sub-category chips.

type MainCat = 'HAIR' | 'FACE' | 'BODY' | 'NAILS';
// Roles match nextjs-beauty's DISC_ROLE lookup (gallery-page/taxonomy.ts).
const MAIN_CATS: {id: MainCat; label: string; url: string; role: string}[] = [
  {id: 'HAIR', label: 'Hair', url: 'gallery-hair', role: 'Stylist'},
  {id: 'FACE', label: 'Face', url: 'gallery-face', role: 'Master Therapist'},
  {id: 'BODY', label: 'Body', url: 'gallery-body', role: 'Master Therapist'},
  {id: 'NAILS', label: 'Nails', url: 'gallery-nails', role: 'Nail Specialist'},
];

type Photo = LightboxPhoto;

const Pill = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={[styles.pill, active && styles.pillActive]}>
    {active ? (
      <LinearGradient
        colors={[appColors.primaryStrong, appColors.primary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />
    ) : null}
    <Paragraph
      size={14}
      weight={active ? '700' : '600'}
      style={{color: active ? appColors.white : appColors.ink}}>
      {label}
    </Paragraph>
  </TouchableOpacity>
);

const Chip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={[styles.chip, active && styles.chipActive]}>
    <Paragraph
      size={12}
      weight={active ? '700' : '600'}
      style={{color: active ? appColors.primary : appColors.ink}}>
      {label}
    </Paragraph>
  </TouchableOpacity>
);

const GalleryCatalog: React.FC = () => {
  const dict = useAppSelector(state => state.SystemContentReducer.content);

  const [tab, setTab] = useState<'service' | 'specialist'>('service');
  const [mainCat, setMainCat] = useState<MainCat>('HAIR');
  const [specialist, setSpecialist] = useState<string>('');
  const [query, setQuery] = useState('');

  // Photos are fetched per selected category — RTK Query caches by URL, so
  // switching back to a visited category is instant.
  const catEntry = MAIN_CATS.find(c => c.id === mainCat);
  const categoryUrl = catEntry?.url ?? '';
  const {data: photoPagesData, isFetching} = useGetChildPagesByUrlQuery({
    url: categoryUrl,
  });
  const photoPages = (photoPagesData as IPagesEntity[]) ?? [];

  // Flatten photo pages → per-image records: url, master name, title (category
  // label) and role (per-category role for the accent-pink caption suffix).
  const photos: Photo[] = useMemo(() => {
    const out: Photo[] = [];
    const title = catEntry?.label ?? '';
    const role = catEntry?.role ?? '';
    for (const page of photoPages) {
      const files =
        (page.attributeValues?.gallery_photos?.value as any[]) ?? [];
      const linked = page.attributeValues?.master_id?.value as
        | Array<{title?: string}>
        | undefined;
      const master = linked?.[0]?.title?.trim() ?? '';
      files.forEach((f: any, idx: number) => {
        const url = f?.downloadLink;
        if (typeof url === 'string' && url) {
          out.push({
            id: `${page.id}-${idx}`,
            downloadLink: url,
            master,
            title,
            role,
          });
        }
      });
    }
    return out;
  }, [photoPages, catEntry]);

  const specialistsInMain = useMemo(
    () =>
      Array.from(
        new Set(photos.map(p => p.master).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b)),
    [photos],
  );

  // A specialist selection is only valid within the current category.
  const activeSpecialist =
    specialist && specialistsInMain.includes(specialist) ? specialist : '';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return photos.filter(p => {
      if (tab === 'specialist' && activeSpecialist && p.master !== activeSpecialist)
        return false;
      if (q && !p.master.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [photos, tab, activeSpecialist, query]);

  const searching = query.trim().length > 0;

  // Lightbox
  const [lbVisible, setLbVisible] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  const openLightbox = useCallback((idx: number) => {
    setLbIndex(idx);
    setLbVisible(true);
  }, []);

  const searchPlaceholder =
    tab === 'specialist'
      ? (dict?.search_by_specialist_placeholder as string | undefined) ||
        'Search by specialist…'
      : (dict?.search_by_service_placeholder as string | undefined) ||
        'Search by service…';

  const photosWord =
    filtered.length === 1
      ? (dict?.photos_word_singular as string | undefined) || 'photo'
      : (dict?.photos_word_plural as string | undefined) || 'photos';

  const renderHeader = () => (
    <View style={{gap: 14, paddingBottom: 14}}>
      {/* Tabs: Service | Specialist */}
      <View style={styles.tabsRow}>
        {(['service', 'specialist'] as const).map(t => {
          const active = tab === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              activeOpacity={0.7}
              style={styles.tabBtn}>
              <Paragraph
                size={15}
                weight={active ? '700' : '400'}
                style={{
                  color: active ? appColors.primary : appColors.gray,
                }}>
                {t === 'service'
                  ? (dict?.gallery_tab_service as string | undefined) ||
                    'Service'
                  : (dict?.gallery_tab_specialist as string | undefined) ||
                    'Specialist'}
              </Paragraph>
              {active ? <View style={styles.tabUnderline} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main-category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{gap: 8, paddingHorizontal: 2}}>
        {MAIN_CATS.map(cat => (
          <Pill
            key={cat.id}
            label={cat.label}
            active={mainCat === cat.id}
            onPress={() => {
              setMainCat(cat.id);
              setSpecialist('');
            }}
          />
        ))}
      </ScrollView>

      {/* Specialist chips — only on the Specialist tab */}
      {tab === 'specialist' ? (
        specialistsInMain.length === 0 ? (
          <Paragraph size={12} style={{color: appColors.gray, textAlign: 'center'}}>
            {(dict?.no_specialists_category_text as string | undefined) ||
              'No specialists in this category yet.'}
          </Paragraph>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{gap: 8, paddingHorizontal: 2}}>
            <Chip
              label={(dict?.gallery_all_text as string | undefined) || 'All'}
              active={activeSpecialist === ''}
              onPress={() => setSpecialist('')}
            />
            {specialistsInMain.map(s => (
              <Chip
                key={s}
                label={s}
                active={activeSpecialist === s}
                onPress={() => setSpecialist(s)}
              />
            ))}
          </ScrollView>
        )
      ) : null}

      {/* Search */}
      <View style={styles.searchWrap}>
        <Search size={16} color={appColors.ink} style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={searchPlaceholder}
          placeholderTextColor={appColors.gray}
          style={styles.searchInput}
        />
        {searching ? (
          <TouchableOpacity
            onPress={() => setQuery('')}
            style={styles.searchClear}>
            <X size={14} color={appColors.gray} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Counter */}
      <View style={{alignItems: 'center'}}>
        <Paragraph size={13} style={{color: appColors.gray}}>
          {filtered.length} {photosWord}
        </Paragraph>
      </View>
    </View>
  );

  return (
    <>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{gap: 10}}
        contentContainerStyle={{gap: 10, paddingBottom: 24}}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isFetching ? (
            <FlexLoader height={200} />
          ) : (
            <View style={{paddingVertical: 40, alignItems: 'center'}}>
              <Paragraph size={13} style={{color: appColors.gray}}>
                {(dict?.no_portfolio_text as string | undefined) ||
                  'No portfolio yet for this combination.'}
              </Paragraph>
            </View>
          )
        }
        renderItem={({item, index}) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => openLightbox(index)}
            style={styles.cell}>
            <ExpoImage
              source={{uri: item.downloadLink}}
              style={StyleSheet.absoluteFill}
              contentFit={'cover'}
              transition={200}
            />
          </TouchableOpacity>
        )}
      />
      <GalleryLightbox
        visible={lbVisible}
        onClose={() => setLbVisible(false)}
        items={filtered}
        defaultIndex={lbIndex}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginTop: 4,
  },
  tabBtn: {
    paddingHorizontal: 4,
    paddingBottom: 6,
    position: 'relative',
  },
  tabUnderline: {
    position: 'absolute',
    left: 4,
    right: 4,
    bottom: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: appColors.primary,
  },
  pill: {
    minWidth: 96,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  pillActive: {
    borderColor: 'transparent',
    shadowColor: appColors.primaryStrong,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
  },
  chipActive: {
    borderColor: appColors.primary,
    backgroundColor: 'rgba(246,14,251,0.08)',
  },
  searchWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: appColors.white,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    borderRadius: 12,
    paddingLeft: 40,
    paddingRight: 40,
    paddingVertical: 12,
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: appColors.charcoal,
  },
  searchClear: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: appColors.slate150,
  },
});

export default GalleryCatalog;
