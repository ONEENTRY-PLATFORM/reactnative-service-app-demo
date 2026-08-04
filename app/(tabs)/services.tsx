import {useMemo, useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Search, X} from 'lucide-react-native';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';
import {Screen} from '@/components/shared/Screen';
import FlexLoader from '@/components/shared/FlexLoader';
import EmptyState from '@/components/shared/EmptyState';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {useAppSelector} from '@/state/hooks';
import {
  useGetChildPagesByUrlQuery,
  useGetProductsByPageUrlQuery,
} from '@/api';
import ServiceCard from '@/components/content/ServicesScreen/ServiceCard';

// /services port of nextjs-beauty. Layout mirrors the web mobile:
//   1. Hero (fuchsia gradient bg, kicker, big title, stats subtitle)
//   2. StatsStrip (fuchsia bar with SERVICES / LOCATIONS / CATEGORIES)
//   3. SalonSelector pills
//   4. Search input
//   5. Category pills (children of /services)
//   6. Subcategory pills (children of active category, if any)
//   7. Services list — filtered by search or category+subcategory
const {width: SCREEN_WIDTH} = Dimensions.get('window');

const Pill = ({
  label,
  active,
  onPress,
  variant = 'solid',
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  variant?: 'solid' | 'ghost';
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[
      styles.pill,
      variant === 'ghost' && styles.pillGhost,
      active && (variant === 'ghost' ? styles.pillGhostActive : styles.pillActive),
    ]}>
    <Paragraph
      size={12}
      weight={active ? '700' : '400'}
      style={{
        color: active
          ? variant === 'ghost'
            ? appColors.primary
            : appColors.white
          : appColors.ink,
        letterSpacing: 0.3,
      }}>
      {label}
    </Paragraph>
  </TouchableOpacity>
);

export default function ServicesScreen() {
  const dict = useAppSelector(state => state.SystemContentReducer.content);
  const salons = useAppSelector(state => state.SalonsReducer.salons);

  const {data: categoriesData, isLoading: catLoading} =
    useGetChildPagesByUrlQuery({url: 'services'});
  const categories: IPagesEntity[] = (categoriesData as IPagesEntity[]) ?? [];

  const [activeCatUrl, setActiveCatUrl] = useState<string | null>(null);
  const [activeSubUrl, setActiveSubUrl] = useState<string | null>(null);
  const [selectedSalonUrl, setSelectedSalonUrl] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const currentCatUrl =
    activeCatUrl && categories.some(c => c.pageUrl === activeCatUrl)
      ? activeCatUrl
      : categories[0]?.pageUrl ?? null;

  const {data: subcategoriesData} = useGetChildPagesByUrlQuery(
    {url: currentCatUrl ?? ''},
    {skip: !currentCatUrl},
  );
  const subcategories: IPagesEntity[] =
    ((subcategoriesData as IPagesEntity[]) ?? []).filter(
      p => p.pageUrl && p.pageUrl !== currentCatUrl,
    );

  const currentSubUrl =
    activeSubUrl && subcategories.some(s => s.pageUrl === activeSubUrl)
      ? activeSubUrl
      : subcategories[0]?.pageUrl ?? null;

  const productsUrl = currentSubUrl ?? currentCatUrl ?? '';
  const {data: productsData, isLoading: productsLoading} =
    useGetProductsByPageUrlQuery(
      {pageUrl: productsUrl},
      {skip: !productsUrl},
    );
  const products = ((productsData as any[]) ?? []) as any[];

  const searching = query.trim().length > 0;
  const filtered = useMemo(() => {
    if (!searching) return products;
    const q = query.trim().toLowerCase();
    return products.filter(p =>
      String(p.localizeInfos?.title ?? '')
        .toLowerCase()
        .includes(q),
    );
  }, [products, searching, query]);

  const stats: [string | number, string][] = [
    [products.length || '—', dict?.services_stat_services ?? 'Services'],
    [salons.length || 3, dict?.services_stat_locations ?? 'Locations'],
    [categories.length || '—', dict?.services_stat_categories ?? 'Categories'],
  ];

  const heroTitle =
    (dict?.services_title as string | undefined) ?? 'Services & Prices';
  const heroKicker = (dict?.site_name as string | undefined) ?? 'Beauty Studio';
  const heroSubtitle =
    products.length > 0
      ? `${products.length} services · ${salons.length || 3} locations across Dubai`
      : undefined;

  return (
    <View style={{flex: 1, backgroundColor: appColors.white}}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 120}}>
        {/* 1. Hero */}
        <View style={styles.hero}>
          <LinearGradient
            colors={[appColors.cyanAccent + 'aa', appColors.primary + 'ee']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <Paragraph
              color={'white'}
              size={11}
              style={{
                textTransform: 'uppercase',
                letterSpacing: 5,
                opacity: 0.85,
                marginBottom: 8,
              }}>
              {heroKicker}
            </Paragraph>
            <Paragraph
              family={'league-gothic'}
              color={'white'}
              size={40}
              style={{
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
              {heroTitle}
            </Paragraph>
            {heroSubtitle ? (
              <Paragraph
                color={'white'}
                size={13}
                style={{textAlign: 'center', opacity: 0.85, marginTop: 8}}>
                {heroSubtitle}
              </Paragraph>
            ) : null}
          </View>
        </View>

        {/* 2. Stats strip */}
        <LinearGradient
          colors={[appColors.primary, appColors.primaryStrong]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.stats}>
          {stats.map(([value, label], i) => (
            <View key={label} style={styles.statItem}>
              <Paragraph
                family={'league-gothic'}
                color={'white'}
                size={28}
                style={{textAlign: 'center', letterSpacing: 0.5}}>
                {value}
              </Paragraph>
              <Paragraph
                color={'white'}
                size={11}
                style={{
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginTop: 2,
                }}>
                {label}
              </Paragraph>
              {i < stats.length - 1 ? <View style={styles.statDivider} /> : null}
            </View>
          ))}
        </LinearGradient>

        <Screen edges={['horizontal']}>
          <View style={{gap: 16, paddingTop: 16}}>
            {/* 3. Salon selector */}
            {salons.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{gap: 8, paddingRight: 12}}>
                <Pill
                  label={dict?.all_studios_text ?? 'All studios'}
                  active={selectedSalonUrl === null}
                  onPress={() => setSelectedSalonUrl(null)}
                />
                {salons.map(s => (
                  <Pill
                    key={s.id}
                    label={
                      (s.localizeInfos?.title as string | undefined) ??
                      s.pageUrl ??
                      ''
                    }
                    active={selectedSalonUrl === s.pageUrl}
                    onPress={() => setSelectedSalonUrl(s.pageUrl)}
                  />
                ))}
              </ScrollView>
            ) : null}

            {/* 4. Search */}
            <View style={styles.searchWrap}>
              <Search
                size={16}
                color={appColors.ink}
                style={styles.searchIcon}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={
                  dict?.search_by_service_placeholder ?? 'Search by service…'
                }
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

            {/* 5. Category pills */}
            {!searching && categories.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{gap: 8, paddingRight: 12}}>
                {categories.map(cat => (
                  <Pill
                    key={cat.id}
                    label={(cat.localizeInfos?.title as string) ?? cat.pageUrl}
                    active={currentCatUrl === cat.pageUrl}
                    onPress={() => {
                      setActiveCatUrl(cat.pageUrl);
                      setActiveSubUrl(null);
                    }}
                  />
                ))}
              </ScrollView>
            ) : null}

            {/* 6. Subcategory pills */}
            {!searching && subcategories.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{gap: 8, paddingRight: 12}}>
                {subcategories.map(sub => (
                  <Pill
                    key={sub.id}
                    variant={'ghost'}
                    label={(sub.localizeInfos?.title as string) ?? sub.pageUrl}
                    active={currentSubUrl === sub.pageUrl}
                    onPress={() => setActiveSubUrl(sub.pageUrl)}
                  />
                ))}
              </ScrollView>
            ) : null}

            {/* 7. Services list */}
            {(catLoading || productsLoading) && !filtered.length ? (
              <FlexLoader height={200} />
            ) : filtered.length > 0 ? (
              <View style={{gap: 10}}>
                {filtered.map(item => (
                  <ServiceCard key={String(item.id)} service={item} />
                ))}
              </View>
            ) : (
              <EmptyState
                compact
                title={dict?.no_services_section_text ?? 'No services'}
                description={
                  searching
                    ? `Nothing matches “${query.trim()}”.`
                    : 'This section has no services yet.'
                }
              />
            )}
          </View>
        </Screen>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    width: SCREEN_WIDTH,
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  statDivider: {
    position: 'absolute',
    right: 0,
    top: 6,
    bottom: 6,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: appColors.slate150,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillGhost: {
    backgroundColor: 'transparent',
    borderColor: appColors.slate200,
  },
  pillActive: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },
  pillGhostActive: {
    backgroundColor: 'transparent',
    borderColor: appColors.primary,
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
    borderWidth: 1,
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
});
