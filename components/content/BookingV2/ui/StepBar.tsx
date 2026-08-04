import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {BRAND_GRADIENT, MUTED, PINK} from '../constants';
import type {StepKey} from '../types';

// Ported from nextjs-beauty StepBar. Row of step pills, brand-gradient on the
// active one; earlier steps are tappable (`onGo`) to jump back.

const LABEL_BY_KEY: Record<StepKey, string> = {
  salon: 'Salon',
  service: 'Service',
  specialist: 'Specialist',
  datetime: 'Time',
};

interface Props {
  steps: StepKey[];
  currentIdx: number;
  onGo: (idx: number) => void;
}

const StepBar: React.FC<Props> = ({steps, currentIdx, onGo}) => (
  <View style={styles.row}>
    {steps.map((key, idx) => {
      const active = idx === currentIdx;
      const done = idx < currentIdx;
      return (
        <TouchableOpacity
          key={key}
          onPress={() => (done ? onGo(idx) : undefined)}
          disabled={!done && !active}
          activeOpacity={0.85}
          style={[styles.chip, active && styles.chipActive]}>
          {active ? (
            <LinearGradient
              colors={BRAND_GRADIENT as unknown as [string, string]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <Paragraph
            size={11}
            weight={'700'}
            style={{
              color: active ? appColors.white : done ? PINK : MUTED,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
            {idx + 1}. {LABEL_BY_KEY[key]}
          </Paragraph>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    flexGrow: 1,
    minWidth: 60,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: appColors.slate150,
    overflow: 'hidden',
    backgroundColor: appColors.white,
  },
  chipActive: {
    borderColor: 'transparent',
  },
});

export default StepBar;
