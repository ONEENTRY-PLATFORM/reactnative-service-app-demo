import {useLocalSearchParams} from 'expo-router';

// Ported from nextjs-beauty components/layout/booking-page/hooks/
// useServicesPrefill.ts. Reads the `services` query the offer cards navigate
// with (e.g. /booking?services=233,240) and returns the product ids to
// preselect. Empty when the query is absent or malformed.

export const useServicesPrefill = (): number[] => {
  const params = useLocalSearchParams();
  const raw = params.services;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string' || !value) return [];
  return value
    .split(',')
    .filter(part => /^\d+$/.test(part))
    .map(Number);
};
