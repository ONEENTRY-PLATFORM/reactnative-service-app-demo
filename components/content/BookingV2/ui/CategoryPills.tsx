import React from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {BRAND_GRADIENT, MUTED} from '../constants';

// Horizontal category pill row for Service and Specialist steps.
interface Props {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}

const CategoryPills: React.FC<Props> = ({categories, active, onChange}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{gap: 8, paddingHorizontal: 2}}>
    {categories.map(cat => {
      const isActive = cat === active;
      return (
        <TouchableOpacity
          key={cat}
          onPress={() => onChange(cat)}
          activeOpacity={0.85}
          style={[styles.pill, isActive && styles.pillActive]}>
          {isActive ? (
            <LinearGradient
              colors={BRAND_GRADIENT as unknown as [string, string]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <Paragraph
            size={13}
            weight={isActive ? '700' : '600'}
            style={{color: isActive ? appColors.white : MUTED}}>
            {cat}
          </Paragraph>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
    overflow: 'hidden',
  },
  pillActive: {
    borderColor: 'transparent',
  },
});

export default CategoryPills;
