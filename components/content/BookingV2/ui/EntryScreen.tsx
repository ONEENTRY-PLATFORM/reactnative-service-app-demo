import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {ChevronRight, MapPin, User} from 'lucide-react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {BRAND_GRADIENT, MUTED, PINK} from '../constants';
import type {BookingFlow} from '../types';

// Mobile port of nextjs-beauty EntryScreen. Web mobile shows a segmented
// Studio/Specialist toggle with a Continue button — same here.

const OPTIONS: {
  flow: BookingFlow;
  title: string;
  subtitle: string;
  Icon: typeof MapPin;
}[] = [
  {
    flow: 'salon-first',
    title: 'Studio',
    subtitle: 'Pick a location, choose your service, then a specialist',
    Icon: MapPin,
  },
  {
    flow: 'specialist-first',
    title: 'Specialist',
    subtitle:
      'Browse our specialists by category — the studio and time come with them',
    Icon: User,
  },
];

interface Props {
  onChoose: (flow: BookingFlow) => void;
}

const EntryScreen: React.FC<Props> = ({onChoose}) => {
  const [pick, setPick] = useState<BookingFlow>('salon-first');
  const picked = OPTIONS.find(o => o.flow === pick) ?? OPTIONS[0];

  return (
    <View style={{gap: 20}}>
      <View style={{gap: 4}}>
        <Paragraph
          size={11}
          weight={'700'}
          style={{color: PINK, letterSpacing: 2, textTransform: 'uppercase'}}>
          Start your booking
        </Paragraph>
        <Paragraph size={20} weight={'400'} color={'charcoal'}>
          How would you like to start?
        </Paragraph>
      </View>

      <View style={styles.segment}>
        {OPTIONS.map(o => {
          const active = pick === o.flow;
          return (
            <TouchableOpacity
              key={o.flow}
              onPress={() => setPick(o.flow)}
              activeOpacity={0.85}
              style={[styles.segmentBtn, active && styles.segmentBtnActive]}>
              <Paragraph
                size={12}
                weight={'700'}
                style={{
                  color: active ? PINK : MUTED,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}>
                {o.title}
              </Paragraph>
            </TouchableOpacity>
          );
        })}
      </View>

      <Paragraph size={14} color={'ink'} style={{lineHeight: 20}}>
        {picked?.subtitle}
      </Paragraph>

      <TouchableOpacity
        onPress={() => onChoose(pick)}
        activeOpacity={0.9}
        style={styles.cta}>
        <LinearGradient
          colors={BRAND_GRADIENT as unknown as [string, string]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={StyleSheet.absoluteFill}
        />
        <Paragraph
          size={14}
          weight={'700'}
          color={'white'}
          style={{letterSpacing: 1, textTransform: 'uppercase'}}>
          Continue
        </Paragraph>
        <ChevronRight size={16} color={appColors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#eef0f4',
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  segmentBtnActive: {
    backgroundColor: appColors.white,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: PINK,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
});

export default EntryScreen;
