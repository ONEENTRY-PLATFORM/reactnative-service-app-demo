// Ported from nextjs-beauty components/layout/booking-page/constants.ts.
// Colors and category order match the web mock (BookingPage.tsx). Tokens live
// alongside the existing appColors palette instead of replacing it — the web
// PINK/PINK2 pair also drives the accent gradient elsewhere in the port.

export const PINK = '#ed21f1';
export const PINK2 = '#f60efb';
export const CYAN = '#109AA9';
export const DARK = '#4c4d56';
export const MUTED = '#a8a9b5';

export const BRAND_GRADIENT: readonly [string, string] = [PINK2, PINK];

// Step order per flow. Same tuple the web reducer uses; bookingStepKeys can
// still remove or insert steps at runtime (serviceLocked / multi-salon master).
export const FLOWS: Record<'salon-first' | 'specialist-first', readonly ('salon' | 'service' | 'specialist' | 'datetime')[]> = {
  'salon-first': ['salon', 'service', 'specialist', 'datetime'],
  'specialist-first': ['specialist', 'datetime'],
};

// Fallback time grid — used only when the CMS schedule for a day is missing.
export const TIMES = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

export const FALLBACK_CLOSE_MINUTES = 21 * 60;

export const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const CATEGORY_ORDER = ['Hair', 'Face', 'Body', 'Nails'];

export const ANY_MASTER = '__any__';
