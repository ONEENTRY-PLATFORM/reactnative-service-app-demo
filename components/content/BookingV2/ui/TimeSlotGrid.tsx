import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {MUTED, PINK, TIMES} from '../constants';
import {slotFits, slotMinutes} from '../slotUtils';

// Mobile port of nextjs-beauty TimeSlotGrid. Same rules: fall back to static
// TIMES when the CMS schedule is empty, cut off the tail with slotFits,
// disable past slots on today.

interface Props {
  today: Date;
  todayKey: string;
  selectedDate: string;
  selectedTime: string;
  onTime: (t: string) => void;
  slots: string[];
  hasSchedule: boolean;
  durationMinutes: number;
  closeMinutes: number | null;
}

const TimeSlotGrid: React.FC<Props> = ({
  today,
  todayKey,
  selectedDate,
  selectedTime,
  onTime,
  slots,
  hasSchedule,
  durationMinutes,
  closeMinutes,
}) => {
  const times = hasSchedule ? slots : TIMES;
  const tooLate = times.filter(
    t => !slotFits(t, durationMinutes, closeMinutes),
  );
  const noSlotFits = times.length > 0 && tooLate.length === times.length;
  const nowMinutes =
    selectedDate === todayKey
      ? today.getHours() * 60 + today.getMinutes()
      : -1;

  const noticeStyle = {backgroundColor: `${PINK}0d`, color: MUTED};

  if (times.length === 0) {
    return (
      <View style={[styles.notice, {backgroundColor: `${PINK}0d`}]}>
        <Paragraph size={13} style={{color: MUTED}}>
          No available times on this day. Please pick another date.
        </Paragraph>
      </View>
    );
  }
  if (noSlotFits) {
    return (
      <View style={[styles.notice, {backgroundColor: `${PINK}0d`}]}>
        <Paragraph size={13} style={{color: MUTED}}>
          Your {durationMinutes}-min visit does not fit any of this day's starts
          before closing. Please pick another date or fewer services.
        </Paragraph>
      </View>
    );
  }

  return (
    <View style={{gap: 10}}>
      <Paragraph size={13} weight={'700'} color={'charcoal'}>
        Available times
      </Paragraph>
      <View style={styles.grid}>
        {times.map(t => {
          const active = selectedTime === t;
          const unavailable =
            slotMinutes(t) <= nowMinutes ||
            !slotFits(t, durationMinutes, closeMinutes);
          return (
            <TouchableOpacity
              key={t}
              disabled={unavailable}
              onPress={() => onTime(t)}
              activeOpacity={0.85}
              style={[
                styles.slot,
                active && styles.slotActive,
                unavailable && styles.slotDisabled,
              ]}>
              <Paragraph
                size={13}
                weight={'700'}
                style={{
                  color: active
                    ? appColors.white
                    : unavailable
                      ? '#c6c6d0'
                      : appColors.charcoal,
                  textDecorationLine: unavailable ? 'line-through' : 'none',
                }}>
                {t}
              </Paragraph>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  notice: {
    padding: 14,
    borderRadius: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slot: {
    width: '23%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
  },
  slotActive: {
    borderColor: PINK,
    backgroundColor: PINK,
  },
  slotDisabled: {
    opacity: 0.55,
  },
});

export default TimeSlotGrid;
