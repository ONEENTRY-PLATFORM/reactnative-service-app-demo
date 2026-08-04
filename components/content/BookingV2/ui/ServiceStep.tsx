import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Check, Clock} from 'lucide-react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {PINK} from '../constants';
import type {BookingService} from '../types';
import CategoryPills from './CategoryPills';

// Mobile port of nextjs-beauty ServiceStep. Multi-select toggle with category
// pills (only when >1 category present). The active category is local state —
// the wizard's `categoryFilter` is only synced on selection so a multi-pick
// spanning categories doesn't fight the pills.

interface Props {
  services: BookingService[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

const ServiceStep: React.FC<Props> = ({services, selectedIds, onToggle}) => {
  const [tab, setTab] = useState('All');
  const categories = useMemo(() => {
    const set = new Set(services.map(s => s.category));
    return ['All', ...Array.from(set)];
  }, [services]);

  const visible =
    tab === 'All' ? services : services.filter(s => s.category === tab);

  return (
    <View style={{gap: 14}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Paragraph size={18} weight={'400'} color={'charcoal'}>
          Choose services
        </Paragraph>
        {selectedIds.length > 0 ? (
          <Paragraph size={12} color={'gray'}>
            {selectedIds.length} selected
          </Paragraph>
        ) : null}
      </View>

      {categories.length > 2 ? (
        <CategoryPills categories={categories} active={tab} onChange={setTab} />
      ) : null}

      <FlatList
        data={visible}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{height: 10}} />}
        ListEmptyComponent={
          <Paragraph size={13} color={'gray'}>
            No services in this category.
          </Paragraph>
        }
        renderItem={({item}) => {
          const isPicked = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              onPress={() => onToggle(item.id)}
              activeOpacity={0.85}
              style={[styles.row, isPicked && styles.rowActive]}>
              <View style={[styles.check, isPicked && styles.checkActive]}>
                {isPicked ? (
                  <Check size={14} color={appColors.white} strokeWidth={3} />
                ) : null}
              </View>
              <View style={{flex: 1}}>
                <Paragraph size={14} weight={'700'} color={'charcoal'}>
                  {item.name}
                </Paragraph>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 3,
                  }}>
                  {item.duration ? (
                    <>
                      <Clock size={12} color={appColors.gray} />
                      <Paragraph size={12} color={'gray'}>
                        {item.duration}
                      </Paragraph>
                    </>
                  ) : null}
                </View>
              </View>
              {item.price !== null ? (
                <View style={{alignItems: 'flex-end'}}>
                  <Paragraph size={15} weight={'700'} color={'charcoal'}>
                    {item.price}
                  </Paragraph>
                  {item.currency ? (
                    <Paragraph size={11} color={'gray'}>
                      {item.currency}
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
    padding: 14,
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
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: appColors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: {
    borderColor: PINK,
    backgroundColor: PINK,
  },
});

export default ServiceStep;
