import {ANY_MASTER, FLOWS} from './constants';
import type {
  BookingFlow,
  BookingMaster,
  BookingSalon,
  StepKey,
} from './types';

// Ported verbatim from nextjs-beauty components/layout/booking-page/
// bookingStepKeys.ts. Dynamic order: specialist-first adds a Salon step when
// the chosen specialist works at multiple studios (or ANY_MASTER); salon-first
// drops the Service step when the service was preselected upstream.
const bookingStepKeys = ({
  flow,
  serviceLocked,
  master,
  masters,
  salons,
}: {
  flow: BookingFlow | null;
  serviceLocked: boolean;
  master: string;
  masters: BookingMaster[];
  salons: BookingSalon[];
}): StepKey[] => {
  if (!flow) return [];
  if (flow === 'salon-first') {
    return serviceLocked
      ? ['salon', 'specialist', 'datetime']
      : (FLOWS['salon-first'] as StepKey[]);
  }
  const m = masters.find(x => x.id === master);
  const salonCount =
    master === ANY_MASTER
      ? salons.length
      : (m?.salonIds.length ?? 0) || salons.length;
  return salonCount > 1
    ? ['specialist', 'salon', 'service', 'datetime']
    : ['specialist', 'service', 'datetime'];
};

export default bookingStepKeys;
