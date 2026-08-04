import {expandAttributeTimeIntervals} from 'oneentry';
import type {IAttributeValue} from 'oneentry/dist/base/utils';
import type {BookingService} from './types';

// Ported from nextjs-beauty components/layout/booking-page/utils/*. Same
// semantics: UTC-based schedule expansion so slot labels match what the server
// receives when the appointment is submitted (both ends stay UTC).

const DEFAULT_SERVICE_MINUTES = 60;

export const dayIntervals = (
  schedule: IAttributeValue | undefined,
  dateKey: string,
): [Date, Date][] => {
  const parts = dateKey.split('-').map(Number);
  const [year, month, day] = parts;
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    parts.some(n => Number.isNaN(n))
  ) {
    return [];
  }
  const utcDay = new Date(Date.UTC(year, month, day));
  return expandAttributeTimeIntervals(schedule as any, {
    from: utcDay,
    to: utcDay,
  }).map(([start, end]: [any, any]) => [new Date(start), new Date(end)]);
};

export const daySlots = (
  schedule: IAttributeValue | undefined,
  dateKey: string,
): string[] => {
  const labels = dayIntervals(schedule, dateKey).map(([start]) => {
    const hh = String(start.getUTCHours()).padStart(2, '0');
    const mm = String(start.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });
  return [...new Set(labels)].sort();
};

export const dayCloseMinutes = (
  schedule: IAttributeValue | undefined,
  dateKey: string,
): number | null => {
  const pairs = dayIntervals(schedule, dateKey);
  if (pairs.length === 0) return null;
  const [year = 0, month = 0, day = 1] = dateKey.split('-').map(Number);
  const midnight = Date.UTC(year, month, day);
  return Math.max(
    ...pairs.map(([, end]) => (end.getTime() - midnight) / 60_000),
  );
};

export const slotMinutes = (slot: string): number => {
  const [hh = 0, mm = 0] = slot.split(':').map(Number);
  return (Number.isNaN(hh) ? 0 : hh) * 60 + (Number.isNaN(mm) ? 0 : mm);
};

export const slotFits = (
  slot: string,
  durationMinutes: number,
  closeMinutes: number | null,
): boolean => {
  if (closeMinutes === null || durationMinutes <= 0) return true;
  return slotMinutes(slot) + durationMinutes <= closeMinutes;
};

export const totalServiceMinutes = (services: BookingService[]): number =>
  services.reduce(
    (sum, sv) => sum + (sv.durationMinutes ?? DEFAULT_SERVICE_MINUTES),
    0,
  );

export const todayDateKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
};

export const daysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

export const firstDayOfMonth = (year: number, month: number): number => {
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
};

export const toBookingInterval = ({
  date,
  time,
  services,
}: {
  date: string;
  time: string;
  services: BookingService[];
}): [Date, Date] => {
  const [y = 0, m = 0, d = 1] = date.split('-').map(Number);
  const [hh = 0, mm = 0] = time.split(':').map(Number);
  const start = new Date(Date.UTC(y, m, d, hh, mm));
  const minutes = totalServiceMinutes(services) || 60;
  const end = new Date(start.getTime() + minutes * 60_000);
  return [start, end];
};
