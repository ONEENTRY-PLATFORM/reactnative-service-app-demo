import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Image as ExpoImage} from 'expo-image';
import {ChevronRight, Star} from 'lucide-react-native';
import {router} from 'expo-router';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';

// Mobile row port of nextjs-beauty MobileSpecialistList row: circular avatar
// with a fuchsia ring, name (bold) + role line, cyan star + rating on the
// right and a chevron. Tapping navigates to the master profile.

export type SpecialistRowItem = {
  id: number;
  name: string;
  role: string;
  photoUrl?: string;
  rating: number;
};

const SpecialistRow: React.FC<{item: SpecialistRowItem}> = ({item}) => {
  return (
    <TouchableOpacity
      onPress={() =>
        router.push(`/(tabs)/masters/${item.id}?role=${encodeURIComponent(item.role)}`)
      }
      activeOpacity={0.85}
      style={styles.row}>
      <View style={styles.avatarWrap}>
        {item.photoUrl ? (
          <ExpoImage
            source={{uri: item.photoUrl}}
            style={StyleSheet.absoluteFill}
            contentFit={'cover'}
            transition={200}
          />
        ) : null}
      </View>
      <View style={{flex: 1, minWidth: 0}}>
        <Paragraph
          size={15}
          weight={'700'}
          color={'charcoal'}
          numberOfLines={1}>
          {item.name}
        </Paragraph>
        <Paragraph
          size={13}
          color={'gray'}
          numberOfLines={1}
          style={{marginTop: 1}}>
          {item.role}
        </Paragraph>
      </View>
      <View style={styles.rating}>
        <Star size={16} color={appColors.blue} fill={appColors.blue} />
        <Paragraph size={13} weight={'700'} color={'charcoal'}>
          {item.rating.toFixed(1)}
        </Paragraph>
      </View>
      <ChevronRight size={18} color={appColors.gray} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    borderRadius: 16,
    backgroundColor: appColors.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(237,33,241,0.25)',
    backgroundColor: appColors.slate150,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default SpecialistRow;
