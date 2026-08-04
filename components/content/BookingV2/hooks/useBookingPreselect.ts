import {useState} from 'react';
import {useAppSelector} from '@/state/hooks';
import type {PreselectPreset} from '../bookingReducer';
import type {BookingData, BookingService} from '../types';
import type {ReschedulePrefill} from './useReschedulePrefill';

// Ported from nextjs-beauty components/layout/booking-page/hooks/
// useBookingPreselect.ts. Applies the preselection carried by the reschedule
// query, the ?services= query (offer bundle) or the OrderReducer selection
// left by "Book" buttons elsewhere in the app. Runs while rendering, once per
// distinct payload, never over a flow the user has already started.

interface UseBookingPreselectInput {
  data: BookingData;
  reschedule: ReschedulePrefill;
  queryProductIds: number[];
  // Explicit hand-off from BookingPrefillSlice (offer / repeat / reschedule
  // paths dispatch it before router.navigate). When set, wins over cart.
  salonOverride?: number | null;
  masterAdminOverride?: number | null;
  // Bumps whenever the slice is set — added to cartKey so a repeat visit to
  // the same offer refires preselect after the wizard was reset.
  prefillVersion?: number;
  touched: boolean;
  preselect: (preset: PreselectPreset) => void;
}

export const useBookingPreselect = ({
  data,
  reschedule,
  queryProductIds,
  salonOverride = null,
  masterAdminOverride = null,
  prefillVersion = 0,
  touched,
  preselect,
}: UseBookingPreselectInput): void => {
  const {salons, services, masters} = data;

  // Mobile has an OrderReducer that older screens fill in (services/masters
  // detail pages dispatch selectServiceForOrder). Read it as the local
  // equivalent of the web cart.
  const orderState = useAppSelector(state => state.OrderReducer);
  const cartSalonId: number | undefined = orderState?.salon?.id;
  const cartMasterAdminId: number | undefined = orderState?.master?.id;
  const cartProductId: number | undefined = orderState?.service?.id;

  const fromQuery = queryProductIds.length > 0;
  const effMasterId =
    reschedule.masterId ??
    masterAdminOverride ??
    (fromQuery ? undefined : cartMasterAdminId);
  const effSalonId =
    reschedule.salonId ??
    salonOverride ??
    (fromQuery ? undefined : cartSalonId);
  const preProductIds =
    reschedule.productIds.length > 0
      ? reschedule.productIds
      : queryProductIds.length > 0
        ? queryProductIds
        : cartProductId
          ? [cartProductId]
          : [];

  const cartKey = `v${prefillVersion}:${effMasterId ?? ''}:${preProductIds.join(',')}:${effSalonId ?? ''}`;
  const [appliedKey, setAppliedKey] = useState('');

  // Data may still be loading — if we don't have services yet but a prefill is
  // expected, don't burn the applied key on this render. Wait for services.
  if (preProductIds.length > 0 && services.length === 0) return;

  if (cartKey === appliedKey) return;
  setAppliedKey(cartKey);

  const preMaster = effMasterId
    ? masters.find(m => m.adminId === effMasterId)
    : undefined;
  const preServices = preProductIds
    .map(pid => services.find(s => s.productId === pid))
    .filter((s): s is BookingService => Boolean(s));
  const preService = preServices[0];
  const preSalon = effSalonId ? salons.find(s => s.id === effSalonId) : undefined;
  const preCategories = [...new Set(preServices.map(s => s.category))];
  const preCategory =
    preCategories.length === 1 ? (preCategories[0] ?? 'All') : 'All';

  if (touched) {
    // User is already in a flow — leave them alone.
    return;
  }
  if (preMaster && preService) {
    preselect({
      patch: {
        flow: 'specialist-first',
        master: preMaster.id,
        serviceIds: preServices.map(s => s.id),
        salon: preSalon?.id ?? preMaster.salonIds[0] ?? null,
        categoryFilter: preCategory,
        // Reschedule prefills the previous appointment's date+time so the
        // calendar opens on that month with the slot already highlighted —
        // otherwise the user lands on today's month with nothing selected.
        ...(reschedule.date ? {date: reschedule.date} : {}),
        ...(reschedule.time ? {time: reschedule.time} : {}),
      },
      stepIdx: 'last',
    });
    return;
  }
  if (preMaster) {
    preselect({
      patch: {
        flow: 'specialist-first',
        master: preMaster.id,
        salon:
          preMaster.salonIds.length === 1
            ? (preMaster.salonIds[0] ?? null)
            : null,
      },
      stepIdx: 1,
    });
    return;
  }
  if (preService) {
    preselect({
      patch: {
        flow: 'salon-first',
        serviceIds: preServices.map(s => s.id),
        serviceLocked: true,
        categoryFilter: preCategory,
        ...(preSalon ? {salon: preSalon.id} : {}),
      },
      stepIdx: 0,
    });
  }
};
