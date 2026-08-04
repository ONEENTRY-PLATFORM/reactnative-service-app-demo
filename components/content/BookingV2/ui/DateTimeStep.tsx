import React from 'react';
import {View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {todayDateKey} from '../slotUtils';
import MonthCalendar from './MonthCalendar';
import TimeSlotGrid from './TimeSlotGrid';

// Ported from nextjs-beauty DateTimeStep. Reads "now" once so calendar and
// grid see the same today.

interface Props {
  selectedDate: string;
  selectedTime: string;
  onDate: (d: string) => void;
  onTime: (t: string) => void;
  slots: string[];
  hasSchedule: boolean;
  durationMinutes: number;
  closeMinutes: number | null;
}

const DateTimeStep: React.FC<Props> = ({
  selectedDate,
  selectedTime,
  onDate,
  onTime,
  slots,
  hasSchedule,
  durationMinutes,
  closeMinutes,
}) => {
  const today = new Date();
  const todayKey = todayDateKey();

  return (
    <View style={{gap: 16}}>
      <Paragraph size={18} weight={'400'} color={'charcoal'}>
        Pick date & time
      </Paragraph>
      <MonthCalendar
        today={today}
        todayKey={todayKey}
        selectedDate={selectedDate}
        onDate={onDate}
      />
      {selectedDate ? (
        <TimeSlotGrid
          today={today}
          todayKey={todayKey}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onTime={onTime}
          slots={slots}
          hasSchedule={hasSchedule}
          durationMinutes={durationMinutes}
          closeMinutes={closeMinutes}
        />
      ) : null}
    </View>
  );
};

export default DateTimeStep;
