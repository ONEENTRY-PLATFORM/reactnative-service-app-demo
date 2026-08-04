import React from 'react';
import {useLocalSearchParams} from 'expo-router';
import {Screen} from '@/components/shared/Screen';
import BookingWizard from '@/components/content/BookingV2/BookingWizard';
import {useAppSelector} from '@/state/hooks';

// Full port of nextjs-beauty /booking. The offer / services / reschedule
// prefill is picked up from BookingPrefillSlice (Redux hand-off) — expo-
// router doesn't propagate `params` to an already-mounted tab screen, so a
// slice is the reliable channel. Query params still work as a secondary
// input for deep-link scenarios.
export default function BookingScreen() {
  const params = useLocalSearchParams();
  const rescheduleRaw = params.reschedule;
  const rescheduleStr = Array.isArray(rescheduleRaw)
    ? rescheduleRaw[0]
    : rescheduleRaw;
  const rescheduleFromQuery =
    typeof rescheduleStr === 'string' && /^\d+$/.test(rescheduleStr)
      ? Number(rescheduleStr)
      : null;
  const prepaidRaw = params.prepaid;
  const prepaidStr = Array.isArray(prepaidRaw) ? prepaidRaw[0] : prepaidRaw;
  const rescheduleIsPrepaid = prepaidStr === '1';

  const prefill = useAppSelector(state => state.BookingPrefillReducer);

  return (
    <Screen isFull edges={['horizontal']}>
      <BookingWizard
        servicesPrefill={prefill.productIds}
        salonPrefill={prefill.salonId}
        masterAdminPrefill={prefill.masterAdminId}
        prefillVersion={prefill.version}
        rescheduleOrderId={rescheduleFromQuery}
        rescheduleIsPrepaid={rescheduleIsPrepaid}
      />
    </Screen>
  );
}
