import {useEffect, useState} from 'react';
import {useLocalSearchParams} from 'expo-router';
import {api} from '@/api/defineApi';
import {useAuth} from '@/state/contexts/AuthContext';
import {
  ORDER_FIELD_MASTER,
  ORDER_FIELD_SALON,
  ORDERS_STORAGE_MARKER,
} from '../orderMarkers';

// Ported from nextjs-beauty components/layout/booking-page/hooks/
// useReschedulePrefill.ts. Reads `?reschedule={orderId}`, then fetches the
// order via the SDK. Web uses an RTK query — mobile doesn't have a matching
// hook, so we fetch imperatively inside a useEffect and expose {orderId,
// salonId, masterId, productIds}.

export interface ReschedulePrefill {
  orderId: number | null;
  salonId: number | null;
  masterId: number | null;
  productIds: number[];
  // Same key format as MonthCalendar's cells: "YYYY-M-D" with month 0-indexed.
  date: string | null;
  // "HH:MM", zero-padded, UTC.
  time: string | null;
}

const EMPTY: ReschedulePrefill = {
  orderId: null,
  salonId: null,
  masterId: null,
  productIds: [],
  date: null,
  time: null,
};

const extractIsoStart = (raw: any): string | null => {
  if (!raw) return null;
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) {
    if (raw.length === 0) return null;
    const first = raw[0];
    if (Array.isArray(first)) return typeof first[0] === 'string' ? first[0] : null;
    return typeof first === 'string' ? first : null;
  }
  if (typeof raw === 'object' && raw.value) return extractIsoStart(raw.value);
  return null;
};

const isoToDateTimeKey = (iso: string): {date: string; time: string} | null => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const date = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return {date, time: `${hh}:${mm}`};
};

export const useReschedulePrefill = (): ReschedulePrefill => {
  const params = useLocalSearchParams();
  const raw = params.reschedule;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const orderId =
    typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : null;

  const {user} = useAuth();
  const isAuth = Boolean(user);

  const [prefill, setPrefill] = useState<ReschedulePrefill>(
    orderId ? {...EMPTY, orderId} : EMPTY,
  );

  useEffect(() => {
    let cancelled = false;
    if (!orderId || !isAuth) {
      setPrefill(orderId ? {...EMPTY, orderId} : EMPTY);
      return;
    }
    (async () => {
      const order: any = await api.Orders.getOrderByMarkerAndId(
        ORDERS_STORAGE_MARKER,
        orderId,
      );
      if (cancelled) return;
      if (!order || order.statusCode >= 400) {
        setPrefill({...EMPTY, orderId});
        return;
      }
      const salonValue = order.formData?.find(
        (f: any) => f.marker === ORDER_FIELD_SALON,
      )?.value as number[] | undefined;
      const masterValue = order.formData?.find(
        (f: any) => f.marker === ORDER_FIELD_MASTER,
      )?.value as (string | number)[] | undefined;
      const intervalValue = order.formData?.find(
        (f: any) => f.marker === 'interval',
      )?.value;
      const iso = extractIsoStart(intervalValue);
      const dt = iso ? isoToDateTimeKey(iso) : null;
      const masterId = Number(masterValue?.[0]);
      setPrefill({
        orderId,
        salonId: salonValue?.[0] ?? null,
        masterId: Number.isNaN(masterId) || !masterId ? null : masterId,
        productIds: (order.products ?? []).map((p: any) => p.id as number),
        date: dt?.date ?? null,
        time: dt?.time ?? null,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, isAuth]);

  return prefill;
};
