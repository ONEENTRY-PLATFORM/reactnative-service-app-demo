import React from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Image as ExpoImage} from 'expo-image';
import {Star, Users} from 'lucide-react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {ANY_MASTER, PINK} from '../constants';
import type {
  BookingMaster,
  BookingSalon,
  BookingService,
} from '../types';
import {totalServiceMinutes} from '../slotUtils';
import CategoryPills from './CategoryPills';

// Mobile port of nextjs-beauty SpecialistStep. Category pills at the top,
// then the "Any specialist" card (when allowed and a category is picked),
// then the master rows. Prices show the pick total when services are chosen,
// otherwise the master's own "from" price.

interface Props {
  masters: BookingMaster[];
  selected: string;
  onSelect: (id: string) => void;
  allowAny: boolean;
  services: BookingService[];
  onClearService: () => void;
  categories: string[];
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  salons: BookingSalon[];
  selectedSalon: BookingSalon | undefined;
}

const SpecialistStep: React.FC<Props> = ({
  masters,
  selected,
  onSelect,
  allowAny,
  services,
  onClearService,
  categories,
  categoryFilter,
  onCategoryChange,
}) => {
  const totalPrice =
    services.length > 0
      ? services.reduce((sum, s) => sum + (s.price ?? 0), 0)
      : null;
  const durationLabel = services.length
    ? `${totalServiceMinutes(services)} min`
    : '';
  const currency = services[0]?.currency || '';

  const anyPrice =
    totalPrice ??
    (masters
      .map(m => m.price)
      .filter((p): p is number => typeof p === 'number')
      .sort((a, b) => a - b)[0] ??
      null);

  const showAny = allowAny && categoryFilter !== 'All' && masters.length > 0;

  return (
    <View style={{gap: 14}}>
      <Paragraph size={18} weight={'400'} color={'charcoal'}>
        Choose a specialist
      </Paragraph>

      {services.length > 0 ? (
        <View style={styles.chip}>
          <Paragraph size={12} weight={'700'} color={'primary'} numberOfLines={1}>
            {services.map(s => s.name).join(' + ')}
          </Paragraph>
          <TouchableOpacity onPress={onClearService} activeOpacity={0.7}>
            <Paragraph
              size={11}
              weight={'700'}
              color={'gray'}
              style={{textTransform: 'uppercase', letterSpacing: 1}}>
              Change
            </Paragraph>
          </TouchableOpacity>
        </View>
      ) : null}

      <CategoryPills
        categories={categories}
        active={categoryFilter}
        onChange={onCategoryChange}
      />

      <FlatList
        data={masters}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{height: 10}} />}
        ListEmptyComponent={
          <Paragraph size={13} color={'gray'}>
            No specialists match this selection.
          </Paragraph>
        }
        ListHeaderComponent={
          showAny ? (
            <TouchableOpacity
              onPress={() => onSelect(ANY_MASTER)}
              activeOpacity={0.85}
              style={[
                styles.row,
                selected === ANY_MASTER && styles.rowActive,
                {marginBottom: 10},
              ]}>
              <View style={styles.anyBubble}>
                <Users size={22} color={appColors.white} />
              </View>
              <View style={{flex: 1}}>
                <Paragraph size={15} weight={'700'} color={'charcoal'}>
                  Any specialist
                </Paragraph>
                <Paragraph size={12} color={'gray'} numberOfLines={2}>
                  We'll assign the first available master
                </Paragraph>
              </View>
              {anyPrice !== null ? (
                <View style={{alignItems: 'flex-end'}}>
                  <Paragraph size={11} color={'gray'}>
                    {services.length > 0 ? 'total' : 'from'}
                  </Paragraph>
                  <Paragraph size={15} weight={'700'} color={'charcoal'}>
                    {anyPrice}
                  </Paragraph>
                  {currency ? (
                    <Paragraph size={11} color={'gray'}>
                      {currency}
                    </Paragraph>
                  ) : null}
                </View>
              ) : null}
            </TouchableOpacity>
          ) : null
        }
        renderItem={({item}) => {
          const isPicked = item.id === selected;
          const price = totalPrice ?? item.price;
          return (
            <TouchableOpacity
              onPress={() => onSelect(item.id)}
              activeOpacity={0.85}
              style={[styles.row, isPicked && styles.rowActive]}>
              <View style={styles.avatar}>
                {item.photo ? (
                  <ExpoImage
                    source={{uri: item.photo}}
                    style={StyleSheet.absoluteFill}
                    contentFit={'cover'}
                    transition={200}
                  />
                ) : null}
              </View>
              <View style={{flex: 1}}>
                <Paragraph size={15} weight={'700'} color={'charcoal'}>
                  {item.name}
                </Paragraph>
                <Paragraph size={12} color={'gray'} numberOfLines={1}>
                  {item.grade || item.specialties.join(', ')}
                </Paragraph>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 3,
                  }}>
                  <Star size={13} color={appColors.blue} fill={appColors.blue} />
                  <Paragraph size={12} weight={'700'} color={'charcoal'}>
                    {item.rating.toFixed(1)}
                  </Paragraph>
                  {durationLabel ? (
                    <Paragraph size={11} color={'gray'}>
                      · {durationLabel}
                    </Paragraph>
                  ) : null}
                </View>
              </View>
              {price !== null && price !== undefined ? (
                <View style={{alignItems: 'flex-end'}}>
                  <Paragraph size={11} color={'gray'}>
                    {services.length > 0 ? 'total' : 'from'}
                  </Paragraph>
                  <Paragraph size={15} weight={'700'} color={'charcoal'}>
                    {price}
                  </Paragraph>
                  {currency ? (
                    <Paragraph size={11} color={'gray'}>
                      {currency}
                    </Paragraph>
                  ) : null}
                </View>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
  },
  rowActive: {
    borderColor: PINK,
    shadowColor: PINK,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: appColors.slate150,
    borderWidth: 2,
    borderColor: 'rgba(237,33,241,0.25)',
  },
  anyBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PINK,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(237,33,241,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(237,33,241,0.25)',
  },
});

export default SpecialistStep;
