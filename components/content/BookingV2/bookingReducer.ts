import bookingStepKeys from './bookingStepKeys';
import {ANY_MASTER} from './constants';
import type {BookingData, BookingFlow} from './types';

// Ported verbatim from nextjs-beauty components/layout/booking-page/
// bookingReducer.ts. Wizard state, actions and transitions. No behaviour
// changes — action types and clamp logic match 1:1 so the mobile port stays
// interchangeable with the web reference.

export interface BookingState {
  flow: BookingFlow | null;
  stepIdx: number;
  salon: number | null;
  serviceIds: string[];
  master: string;
  date: string;
  time: string;
  categoryFilter: string;
  serviceLocked: boolean;
  touched: boolean;
}

export const initialBookingState: BookingState = {
  flow: null,
  stepIdx: 0,
  salon: null,
  serviceIds: [],
  master: '',
  date: '',
  time: '',
  categoryFilter: 'All',
  serviceLocked: false,
  touched: false,
};

type PreselectPatch = Partial<
  Pick<
    BookingState,
    | 'flow'
    | 'master'
    | 'serviceIds'
    | 'salon'
    | 'categoryFilter'
    | 'serviceLocked'
    | 'date'
    | 'time'
  >
>;

export interface PreselectPreset {
  patch: PreselectPatch;
  stepIdx: number | 'last';
}

export type BookingAction =
  | {type: 'START_FLOW'; flow: BookingFlow}
  | {type: 'SELECT_SALON'; id: number}
  | {type: 'SELECT_SERVICE'; id: string}
  | {type: 'CLEAR_SERVICE'}
  | {type: 'SELECT_MASTER'; id: string}
  | {type: 'NEXT'}
  | {type: 'BACK'}
  | {type: 'GO_STEP'; idx: number}
  | {type: 'SET_CATEGORY'; category: string}
  | {type: 'SET_DATE'; date: string}
  | {type: 'SET_TIME'; time: string}
  | {type: 'SET_DATE_TODAY'; date: string}
  | {type: 'DROP_TIME'}
  | {type: 'PRESELECT'; preset: PreselectPreset}
  | {type: 'RESET'};

const keysOf = (state: BookingState, data: BookingData) =>
  bookingStepKeys({
    flow: state.flow,
    serviceLocked: state.serviceLocked,
    master: state.master,
    masters: data.masters,
    salons: data.salons,
  });

const categoryOf = (serviceIds: string[], data: BookingData): string => {
  const cats = [
    ...new Set(
      serviceIds
        .map(sid => data.services.find(x => x.id === sid)?.category)
        .filter((c): c is string => Boolean(c)),
    ),
  ];
  return cats.length === 1 ? (cats[0] ?? 'All') : 'All';
};

const transition = (
  state: BookingState,
  action: BookingAction,
  data: BookingData,
): BookingState => {
  switch (action.type) {
    case 'START_FLOW':
      return {
        ...state,
        touched: true,
        flow: action.flow,
        stepIdx: 0,
        categoryFilter: 'All',
        serviceLocked: false,
      };

    case 'SELECT_SALON': {
      const next = {...state, touched: true, salon: action.id};
      if (state.master && state.master !== ANY_MASTER) {
        const m = data.masters.find(x => x.id === state.master);
        if (m && m.salonIds.length > 0 && !m.salonIds.includes(action.id)) {
          next.master = '';
        }
      }
      return next;
    }

    case 'SELECT_SERVICE': {
      const serviceIds = state.serviceIds.includes(action.id)
        ? state.serviceIds.filter(x => x !== action.id)
        : [...state.serviceIds, action.id];
      const next: BookingState = {
        ...state,
        touched: true,
        serviceIds,
        categoryFilter: categoryOf(serviceIds, data),
      };
      if (
        state.master &&
        state.master !== ANY_MASTER &&
        serviceIds.length > 0
      ) {
        const m = data.masters.find(x => x.id === state.master);
        if (
          m &&
          m.serviceIds.length > 0 &&
          !serviceIds.some(sid => m.serviceIds.includes(sid))
        ) {
          next.master = '';
        }
      }
      return next;
    }

    case 'CLEAR_SERVICE':
      return {
        ...state,
        touched: true,
        serviceIds: [],
        serviceLocked: false,
        categoryFilter: 'All',
      };

    case 'SELECT_MASTER': {
      const next: BookingState = {...state, touched: true, master: action.id};
      if (action.id && action.id !== ANY_MASTER) {
        const m = data.masters.find(x => x.id === action.id);
        if (
          state.salon &&
          m &&
          m.salonIds.length > 0 &&
          !m.salonIds.includes(state.salon)
        ) {
          next.salon = null;
        }
        if (m?.salonIds.length === 1) next.salon = m.salonIds[0] ?? null;
      }
      return next;
    }

    case 'NEXT': {
      const keys = keysOf(state, data);
      return state.stepIdx < keys.length - 1
        ? {...state, stepIdx: state.stepIdx + 1}
        : state;
    }

    case 'BACK':
      return state.stepIdx > 0
        ? {...state, touched: true, stepIdx: state.stepIdx - 1}
        : {...state, touched: true, flow: null};

    case 'GO_STEP':
      return {...state, touched: true, stepIdx: action.idx};

    case 'SET_CATEGORY':
      return {...state, touched: true, categoryFilter: action.category};

    case 'SET_DATE':
      return {...state, touched: true, date: action.date, time: ''};

    case 'SET_TIME':
      return {...state, touched: true, time: action.time};

    case 'SET_DATE_TODAY':
      return {...state, date: action.date};

    case 'DROP_TIME':
      return {...state, time: ''};

    case 'PRESELECT': {
      const {preset} = action;
      const next: BookingState = {...state, ...preset.patch};
      const keys = keysOf(next, data);
      next.stepIdx =
        preset.stepIdx === 'last'
          ? Math.max(0, keys.length - 1)
          : preset.stepIdx;
      return next;
    }

    case 'RESET':
      return {...initialBookingState, touched: true};

    default:
      return state;
  }
};

export const makeBookingReducer =
  (data: BookingData) =>
  (state: BookingState, action: BookingAction): BookingState => {
    const next = transition(state, action, data);
    if (!next.flow) return next;
    const keys = keysOf(next, data);
    if (keys.length === 0) return next;
    const clamped = Math.min(next.stepIdx, keys.length - 1);
    return clamped === next.stepIdx ? next : {...next, stepIdx: clamped};
  };
