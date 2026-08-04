import {useMemo, useReducer, useState} from 'react';
import {
  initialBookingState,
  makeBookingReducer,
  type PreselectPreset,
} from '../bookingReducer';
import bookingStepKeys from '../bookingStepKeys';
import {ANY_MASTER} from '../constants';
import {slotFits, todayDateKey} from '../slotUtils';
import type {
  BookingData,
  BookingFlow,
  BookingMaster,
  BookingSalon,
  BookingService,
  StepKey,
} from '../types';
import {useBookingFilters, type BookingFiltersState} from './useBookingFilters';
import {useBookingPayment, type BookingPaymentState} from './useBookingPayment';
import {useBookingPreselect} from './useBookingPreselect';
import {useBookingSchedule, type BookingScheduleState} from './useBookingSchedule';
import {useBookingSubmit} from './useBookingSubmit';
import {useReschedulePrefill} from './useReschedulePrefill';
import {useServicesPrefill} from './useServicesPrefill';

// Ported from nextjs-beauty components/layout/booking-page/hooks/
// useBookingWizard.ts. Composes reducer + filters + schedule + payment +
// submit. Preselect and hydration guards live here too; on RN there is no
// SSR so the hydrated flag is always true — today is picked immediately.

export interface BookingWizardState
  extends BookingFiltersState,
    BookingScheduleState,
    BookingPaymentState {
  flow: BookingFlow | null;
  stepKeys: StepKey[];
  stepIdx: number;
  currentStepKey: StepKey | undefined;
  mobileSummary: boolean;
  setMobileSummary: (v: boolean) => void;
  categoryFilter: string;
  salons: BookingSalon[];
  salon: number | null;
  selectedServiceIds: string[];
  master: string;
  date: string;
  time: string;
  salonObj: BookingSalon | undefined;
  serviceObjs: BookingService[];
  masterObj: BookingMaster | undefined;
  masterAny: boolean;
  canNext: boolean;
  isLastStep: boolean;
  booked: boolean;
  isAuth: boolean;
  isLoading: boolean;
  error: string;
  preselect: (preset: PreselectPreset) => void;
  startFlow: (f: BookingFlow) => void;
  selectSalon: (id: number) => void;
  selectService: (id: string) => void;
  selectMaster: (id: string) => void;
  clearService: () => void;
  handleNext: () => void;
  handleBack: () => void;
  handleConfirm: () => void;
  resetFlow: () => void;
  handleCloseSuccess: () => void;
  goStep: (idx: number) => void;
  onCategoryChange: (cat: string) => void;
  onDate: (d: string) => void;
  onTime: (t: string) => void;
}

interface UseBookingWizardOverrides {
  // Explicit prefill ids from the tab boundary (offer bundle). Prevents the
  // flaky useLocalSearchParams pass-through when the tab is deep-linked.
  servicesPrefill?: number[];
  salonPrefill?: number | null;
  masterAdminPrefill?: number | null;
  // Bumps every time BookingPrefillSlice is set — mixed into the cart-key so
  // a repeat "Book Offer" fires preselect again even when the ids repeat.
  prefillVersion?: number;
  rescheduleOrderId?: number | null;
  rescheduleIsPrepaid?: boolean;
}

export const useBookingWizard = (
  data: BookingData,
  overrides: UseBookingWizardOverrides = {},
): BookingWizardState => {
  const {salons, services, masters} = data;

  const reducer = useMemo(() => makeBookingReducer(data), [data]);
  const [state, dispatch] = useReducer(reducer, initialBookingState);
  const {
    flow,
    stepIdx,
    salon,
    serviceIds,
    master,
    date,
    time,
    categoryFilter,
    serviceLocked,
    touched,
  } = state;

  const payment = useBookingPayment();

  // Query prefills — same three inputs the web reducer merges into a single
  // PRESELECT action. Explicit overrides win over the useLocalSearchParams
  // fallback: nested tab screens sometimes don't see the params.
  const hookReschedule = useReschedulePrefill();
  const hookQueryIds = useServicesPrefill();
  const reschedule =
    overrides.rescheduleOrderId != null
      ? {
          orderId: overrides.rescheduleOrderId,
          salonId: hookReschedule.salonId,
          masterId: hookReschedule.masterId,
          productIds: hookReschedule.productIds,
          date: hookReschedule.date,
          time: hookReschedule.time,
        }
      : hookReschedule;
  const queryProductIds =
    overrides.servicesPrefill && overrides.servicesPrefill.length > 0
      ? overrides.servicesPrefill
      : hookQueryIds;

  const {submit, booked, closeSuccess, isAuth, isLoading, error} =
    useBookingSubmit({
      paymentAccount: payment.paymentAccount,
      rescheduleOrderId: reschedule.orderId,
      rescheduleIsPrepaid: overrides.rescheduleIsPrepaid ?? false,
    });

  useBookingPreselect({
    data,
    reschedule,
    queryProductIds,
    salonOverride: overrides.salonPrefill ?? null,
    masterAdminOverride: overrides.masterAdminPrefill ?? null,
    prefillVersion: overrides.prefillVersion ?? 0,
    touched,
    preselect: preset => dispatch({type: 'PRESELECT', preset}),
  });

  const salonObj = useMemo(
    () => salons.find(s => s.id === salon),
    [salons, salon],
  );
  const serviceObjs = useMemo(
    () =>
      serviceIds
        .map(id => services.find(s => s.id === id))
        .filter((s): s is BookingService => Boolean(s)),
    [services, serviceIds],
  );
  const masterObj = useMemo(
    () =>
      master === ANY_MASTER ? undefined : masters.find(m => m.id === master),
    [masters, master],
  );

  const filters = useBookingFilters({
    data,
    flow,
    salon,
    serviceIds,
    master,
    categoryFilter,
  });
  const schedule = useBookingSchedule({
    masterObj,
    salonObj,
    serviceObjs,
    date,
  });

  // Drop a slot that stopped fitting when the visit length grew (React's
  // "derive state during render" pattern — see web comment).
  if (
    time &&
    !slotFits(time, schedule.durationMinutes, schedule.closeMinutes)
  ) {
    dispatch({type: 'DROP_TIME'});
  }

  const stepKeys = useMemo<StepKey[]>(
    () =>
      bookingStepKeys({flow, serviceLocked, master, masters, salons}),
    [flow, serviceLocked, master, masters, salons],
  );
  const currentStepKey = stepKeys[stepIdx];

  // On RN there is no server render — pick "today" as soon as the Date & Time
  // step becomes active. Web gates this on useHydrated() to avoid SSR drift.
  if (currentStepKey === 'datetime' && !date) {
    dispatch({type: 'SET_DATE_TODAY', date: todayDateKey()});
  }

  const stepDone: Record<StepKey, boolean> = {
    salon: Boolean(salon),
    service: serviceIds.length > 0,
    specialist: Boolean(master),
    datetime: Boolean(date) && Boolean(time),
  };
  const canNext = currentStepKey ? stepDone[currentStepKey] : false;
  const isLastStep = stepIdx === stepKeys.length - 1;

  const [mobileSummary, setMobileSummary] = useState(false);
  if (mobileSummary && !isLastStep) {
    setMobileSummary(false);
  }

  const preselect = (preset: PreselectPreset) =>
    dispatch({type: 'PRESELECT', preset});

  const handleNext = () => dispatch({type: 'NEXT'});
  const handleBack = () => dispatch({type: 'BACK'});
  const resetFlow = () => dispatch({type: 'RESET'});
  const startFlow = (f: BookingFlow) => dispatch({type: 'START_FLOW', flow: f});
  const selectSalon = (id: number) => dispatch({type: 'SELECT_SALON', id});
  const selectService = (id: string) =>
    dispatch({type: 'SELECT_SERVICE', id});
  const clearService = () => dispatch({type: 'CLEAR_SERVICE'});
  const selectMaster = (id: string) => dispatch({type: 'SELECT_MASTER', id});
  const handleConfirm = () => {
    void submit({
      salon: salonObj,
      services: serviceObjs,
      master: masterObj,
      date,
      time,
    });
  };
  const handleCloseSuccess = () => {
    closeSuccess();
    dispatch({type: 'RESET'});
  };
  const goStep = (idx: number) => dispatch({type: 'GO_STEP', idx});
  const onCategoryChange = (cat: string) =>
    dispatch({type: 'SET_CATEGORY', category: cat});
  const onDate = (d: string) => dispatch({type: 'SET_DATE', date: d});
  const onTime = (t: string) => dispatch({type: 'SET_TIME', time: t});

  return {
    ...filters,
    ...schedule,
    ...payment,
    flow,
    stepKeys,
    stepIdx,
    currentStepKey,
    mobileSummary,
    setMobileSummary,
    categoryFilter,
    salons,
    salon,
    selectedServiceIds: serviceIds,
    master,
    date,
    time,
    salonObj,
    serviceObjs,
    masterObj,
    masterAny: master === ANY_MASTER,
    canNext,
    isLastStep,
    booked,
    isAuth,
    isLoading,
    error,
    preselect,
    startFlow,
    selectSalon,
    selectService,
    selectMaster,
    clearService,
    handleNext,
    handleBack,
    handleConfirm,
    resetFlow,
    handleCloseSuccess,
    goStep,
    onCategoryChange,
    onDate,
    onTime,
  };
};
