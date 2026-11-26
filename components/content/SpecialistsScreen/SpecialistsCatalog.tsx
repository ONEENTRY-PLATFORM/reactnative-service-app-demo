import React, {useMemo, useState} from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Search, X} from 'lucide-react-native';
import {IAdminEntity} from 'oneentry/dist/admins/adminsInterfaces';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';
import {useAppSelector} from '@/state/hooks';
import {useGetChildPagesByUrlQuery} from '@/api';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {attrFileUrl} from '@/lib/oneentry/attributes';
import SalonSelector, {
  SalonOption,
} from '@/components/content/SpecialistsScreen/SalonSelector';
import SpecialistRow, {
  SpecialistRowItem,
} from '@/components/content/SpecialistsScreen/SpecialistRow';

// Mobile port of nextjs-beauty /masters (mobile web layout):
//   1. Salon selector (pill dropdown, "All studios" default)
//   2. Main-category pills (Hair / Face / Body / Nails)
//   3. Free-text search
//   4. Compact row list of specialists (avatar + name + role + rating)
//
// A master is counted for a main category when any of its `master_services`
// links points to a page whose main-category parent matches. Masters with no
// service links stay visible under every category (matches the web fallback).

type MainCat = 'HAIR' | 'FACE' | 'BODY' | 'NAILS';
const MAIN_CATS: {id: MainCat; label: string; url: string}[] = [
  {id: 'HAIR', label: 'Hair', url: 'hair'},
  {id: 'FACE', label: 'Face', url: 'face'},
  {id: 'BODY', label: 'Body', url: 'body'},
  {id: 'NAILS', label: 'Nails', url: 'nails'},
];

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

const SpecialistsCatalog: React.FC = () => {
  const dict = useAppSelector(state => state.SystemContentReducer.content);
  const masters = useAppSelector(state => state.MastersReducer.masters);
  const salons = useAppSelector(state => state.SalonsReducer.salons);
  const mainCategories = useAppSelector(
    state => state.CatalogCategoriesReducer.categories,
  );

  const [mainCat, setMainCat] = useState<MainCat>('HAIR');
  const [salonId, setSalonId] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  // Fetch subcategory pages of every main category once so we can build a
  // subcategoryId → mainCategory map. RTK Query caches by URL, so this is a
  // one-shot cost per app session.
  const hairSubs = useGetChildPagesByUrlQuery({url: 'hair'});
  const faceSubs = useGetChildPagesByUrlQuery({url: 'face'});
  const bodySubs = useGetChildPagesByUrlQuery({url: 'body'});
  const nailsSubs = useGetChildPagesByUrlQuery({url: 'nails'});

  const categoryByPageId = useMemo(() => {
    const map = new Map<number, MainCat>();
    // Main-category page ids themselves — a master may link at that level too.
    mainCategories.forEach(page => {
      const key = MAIN_CATS.find(c => c.url === page.pageUrl)?.id;
      if (key) map.set(page.id, key);
    });
    const groups: {cat: MainCat; data: IPagesEntity[] | undefined}[] = [
      {cat: 'HAIR', data: hairSubs.data as IPagesEntity[] | undefined},
      {cat: 'FACE', data: faceSubs.data as IPagesEntity[] | undefined},
      {cat: 'BODY', data: bodySubs.data as IPagesEntity[] | undefined},
      {cat: 'NAILS', data: nailsSubs.data as IPagesEntity[] | undefined},
    ];
    for (const {cat, data} of groups) {
      (data ?? []).forEach(p => map.set(p.id, cat));
    }
    return map;
  }, [
    mainCategories,
    hairSubs.data,
    faceSubs.data,
    bodySubs.data,
    nailsSubs.data,
  ]);

  const salonOptions: SalonOption[] = useMemo(
    () =>
      salons.map(s => ({
        id: s.id,
        name: (s.localizeInfos?.title as string) || `Studio ${s.id}`,
        address: (s.attributeValues?.salon_address?.value as
          | string
          | undefined) || undefined,
      })),
    [salons],
  );
  const salonNameById = useMemo(
    () => new Map(salons.map(s => [s.id, (s.localizeInfos?.title as string) || ''])),
    [salons],
  );

  const buildRow = (m: IAdminEntity): SpecialistRowItem | null => {
    const attrs: any = m.attributeValues ?? {};
    const name = (attrs.master_name?.value as string | undefined) ?? '';
    if (!name) return null;

    const salonEntries = Array.isArray(attrs.master_salon?.value)
      ? attrs.master_salon.value
      : [];
    const salonPageId = salonEntries[0]?.value?.id;
    const salonName =
      typeof salonPageId === 'number'
        ? salonNameById.get(salonPageId) ?? ''
        : '';

    const shortDescription =
      (attrs.master_short_description?.value as string | undefined) ||
      (dict?.specialist_text as string | undefined) ||
      'Specialist';
    const role = salonName ? `${shortDescription} · ${salonName}` : shortDescription;

    const photoUrl = attrFileUrl(attrs.master_image);

    const rating = Number(attrs.master_rating?.value) || 5;

    return {id: m.id, name, role, photoUrl, rating};
  };

  const masterCategories = (m: IAdminEntity): MainCat[] => {
    const attrs: any = m.attributeValues ?? {};
    const links = Array.isArray(attrs.master_services?.value)
      ? attrs.master_services.value
      : [];
    const cats = new Set<MainCat>();
    for (const link of links) {
      const parentId = link?.value?.parentId;
      if (typeof parentId === 'number') {
        const cat = categoryByPageId.get(parentId);
        if (cat) cats.add(cat);
      }
    }
    // Fallback: master without service links stays visible everywhere.
    return cats.size > 0 ? Array.from(cats) : ['HAIR', 'FACE', 'BODY', 'NAILS'];
  };

  const masterSalonId = (m: IAdminEntity): number | undefined => {
    const attrs: any = m.attributeValues ?? {};
    const entries = Array.isArray(attrs.master_salon?.value)
      ? attrs.master_salon.value
      : [];
    return entries[0]?.value?.id as number | undefined;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return masters
      .filter(m => {
        if (salonId !== null && masterSalonId(m) !== salonId) return false;
        if (!masterCategories(m).includes(mainCat)) return false;
        if (q) {
          const name = (m.attributeValues?.master_name?.value as string) || '';
          if (!name.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .map(buildRow)
      .filter((row): row is SpecialistRowItem => row !== null);
  }, [masters, salonId, mainCat, query, categoryByPageId, salonNameById, dict]);

  const searching = query.trim().length > 0;

  const listHeader = (
    <View style={{gap: 12, paddingBottom: 12}}>
      <SalonSelector
        options={salonOptions}
        selectedId={salonId}
        onSelect={setSalonId}
        allLabel={
          (dict?.all_studios_text as string | undefined) || 'All studios'
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{gap: 8, paddingHorizontal: 2}}>
        {MAIN_CATS.map(cat => (
          <Pill
            key={cat.id}
            label={cat.label}
            active={mainCat === cat.id}
            onPress={() => setMainCat(cat.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.searchWrap}>
        <Search size={16} color={appColors.ink} style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={
            (dict?.search_specialist_placeholder as string | undefined) ||
            'Search specialist'
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
    </View>
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={{gap: 10, paddingBottom: 24}}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={
        <View style={{paddingVertical: 32, alignItems: 'center'}}>
          <Paragraph size={13} color={'gray'}>
            {(dict?.no_specialists_found_text as string | undefined) ||
              'No specialists found.'}
          </Paragraph>
        </View>
      }
      renderItem={({item}) => <SpecialistRow item={item} />}
    />
  );
};

const styles = StyleSheet.create({
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
});

export default SpecialistsCatalog;
