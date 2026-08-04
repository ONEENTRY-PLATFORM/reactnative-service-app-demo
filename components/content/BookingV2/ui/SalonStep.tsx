import React from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {MapPin} from 'lucide-react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {PINK} from '../constants';
import type {BookingSalon} from '../types';

// Mobile port of nextjs-beauty SalonStep. Row list; tap → onSelect(id). The
// selected row shows a pink ring + filled dot; others show an empty circle.

interface Props {
  salons: BookingSalon[];
  selected: number | null;
  onSelect: (id: number) => void;
}

const SalonStep: React.FC<Props> = ({salons, selected, onSelect}) => (
  <View style={{gap: 12}}>
    <Paragraph size={18} weight={'400'} color={'charcoal'}>
      Choose a studio
    </Paragraph>
    <FlatList
      data={salons}
      keyExtractor={item => String(item.id)}
      scrollEnabled={false}
      ItemSeparatorComponent={() => <View style={{height: 10}} />}
      renderItem={({item}) => {
        const isPicked = item.id === selected;
        return (
          <TouchableOpacity
            onPress={() => onSelect(item.id)}
            activeOpacity={0.85}
            style={[styles.row, isPicked && styles.rowActive]}>
            <View style={styles.iconBubble}>
              <MapPin size={16} color={PINK} />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <Paragraph size={15} weight={'700'} color={'charcoal'}>
                {item.name}
              </Paragraph>
              <Paragraph size={12} color={'gray'} numberOfLines={1}>
                {[item.address, item.phone].filter(Boolean).join(' · ')}
              </Paragraph>
            </View>
            <View
              style={[styles.radio, isPicked && styles.radioActive]}>
              {isPicked ? <View style={styles.radioDot} /> : null}
            </View>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <Paragraph size={13} color={'gray'}>
          No studios available yet.
        </Paragraph>
      }
    />
  </View>
);

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
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(237,33,241,0.1)',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: appColors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: PINK,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PINK,
  },
});

export default SalonStep;
