import {useMemo} from 'react';
import {FALLBACK_CLOSE_MINUTES} from '../constants';
import type {BookingMaster, BookingSalon, BookingService} from '../types';
import {
  dayCloseMinutes,
  daySlots,
  totalServiceMinutes,
} from '../slotUtils';

// Ported verbatim from nextjs-beauty components/layout/booking-page/hooks/
// useBookingSchedule.ts. Resolves the slot source for Date & Time: master's
// schedule wins, salon's is the fallback for "Any specialist".

export interface BookingScheduleInput {
  masterObj: BookingMaster | undefined;
  salonObj: BookingSalon | undefined;
  serviceObjs: BookingService[];
  date: string;
}

export interface BookingScheduleState {
  slots: string[];
  hasSchedule: boolean;
  durationMinutes: number;
  closeMinutes: number | null;
}

export const useBookingSchedule = ({
  masterObj,
  salonObj,
  serviceObjs,
  date,
}: BookingScheduleInput): BookingScheduleState => {
  const daySchedule = masterObj?.schedule ?? salonObj?.schedule;
  const hasSchedule = Boolean(daySchedule);

  const slots = useMemo(
    () => (date && daySchedule ? daySlots(daySchedule, date) : []),
    [date, daySchedule],
  );

  const durationMinutes = useMemo(
    () => totalServiceMinutes(serviceObjs),
    [serviceObjs],
  );

  const closeMinutes = useMemo(
    () =>
      hasSchedule
        ? date
          ? dayCloseMinutes(daySchedule, date)
          : null
        : FALLBACK_CLOSE_MINUTES,
    [hasSchedule, daySchedule, date],
  );

  return {slots, hasSchedule, durationMinutes, closeMinutes};
};
