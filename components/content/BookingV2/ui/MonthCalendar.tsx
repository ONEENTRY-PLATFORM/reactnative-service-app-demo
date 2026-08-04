import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {ChevronLeft, ChevronRight} from 'lucide-react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {DAYS, MONTHS, MUTED, PINK} from '../constants';
import {daysInMonth, firstDayOfMonth} from '../slotUtils';

// Month calendar mirroring nextjs-beauty MonthCalendar. Same date key format
// "year-monthIndex-day" so DateTimeStep, useBookingSchedule and the reducer
// all agree.

interface Props {
  today: Date;
  todayKey: string;
  selectedDate: string;
  onDate: (d: string) => void;
}

const parseDateKey = (
  key: string,
): {year: number; month: number} | null => {
  if (!key) return null;
  const [y, m] = key.split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
  return {year: y as number, month: m as number};
};

const MonthCalendar: React.FC<Props> = ({today, todayKey, selectedDate, onDate}) => {
  // Initial view lands on the month of `selectedDate` when the caller
  // pre-seeded one (reschedule flow) — otherwise it defaults to today.
  const initial = parseDateKey(selectedDate) ?? {
    year: today.getFullYear(),
    month: today.getMonth(),
  };
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  const total = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);

  const isPast = (day: number) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date(today);
    t.setHours(0, 0, 0, 0);
    return d.getTime() < t.getTime();
  };

  return (
    <View style={{gap: 10}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prev} style={styles.navBtn}>
          <ChevronLeft size={18} color={MUTED} />
        </TouchableOpacity>
        <Paragraph size={15} weight={'700'} color={'charcoal'}>
          {MONTHS[month]} {year}
        </Paragraph>
        <TouchableOpacity onPress={next} style={styles.navBtn}>
          <ChevronRight size={18} color={MUTED} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {DAYS.map(d => (
          <View key={d} style={styles.weekCell}>
            <Paragraph size={11} weight={'700'} style={{color: MUTED}}>
              {d}
            </Paragraph>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) {
            return <View key={`e-${i}`} style={styles.cell} />;
          }
          const key = `${year}-${month}-${day}`;
          const isSelected = key === selectedDate;
          const isToday = key === todayKey;
          const past = isPast(day);
          return (
            <TouchableOpacity
              key={key}
              disabled={past}
              onPress={() => onDate(key)}
              activeOpacity={0.75}
              style={[
                styles.cell,
                styles.dayBtn,
                past && styles.dayPast,
                isToday && !isSelected && styles.dayToday,
                isSelected && styles.daySelected,
              ]}>
              <Paragraph
                size={13}
                weight={isSelected || isToday ? '700' : '400'}
                style={{
                  color: isSelected
                    ? appColors.white
                    : past
                      ? '#c6c6d0'
                      : isToday
                        ? PINK
                        : appColors.charcoal,
                }}>
                {day}
              </Paragraph>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7fb',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 3,
  },
  dayBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dayPast: {opacity: 0.5},
  dayToday: {
    borderWidth: 1.5,
    borderColor: PINK,
    borderRadius: 12,
    margin: 3,
  },
  daySelected: {
    backgroundColor: PINK,
    margin: 3,
    borderRadius: 12,
  },
});

export default MonthCalendar;
