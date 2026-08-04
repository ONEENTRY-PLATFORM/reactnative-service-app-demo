import {storage} from '@/api/defineApi';

// Local list of order ids the user has already rescheduled AWAY from. The
// server-side cancel step may fail (an active Stripe session — paid or
// pending — blocks any update from the client), which leaves the previous
// appointment as an orphan in the API response. Rather than showing the
// user a "ghost" of the old booking next to the new one, we mark it here
// and filter it out of visits history. Salon staff still sees it on their
// side and closes it manually.

const KEY = 'rescheduled_hidden_order_ids';
// Second store: maps NEW order id → OLD paid order id, whenever the
// reschedule was of an already-paid appointment (prepaid path). The new
// order is created as `cash` server-side so the user isn't billed twice,
// but visits history should still show it as PAID (not "Cash") — this
// mapping is how OrderCard knows to do that.
const PREPAID_KEY = 'reschedule_prepaid_map';

const readSet = (): Set<number> => {
  const raw = storage.getString(KEY);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((v): v is number => typeof v === 'number'));
  } catch {
    return new Set();
  }
};

const readPrepaidMap = (): Record<string, number> => {
  const raw = storage.getString(PREPAID_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, number>;
    }
    return {};
  } catch {
    return {};
  }
};

export const hideRescheduledOrder = (orderId: number): void => {
  const set = readSet();
  set.add(orderId);
  storage.set(KEY, JSON.stringify(Array.from(set)));
};

export const getHiddenRescheduledOrderIds = (): Set<number> => readSet();

export const markOrderAsPrepaid = (
  newOrderId: number,
  oldOrderId: number,
): void => {
  const map = readPrepaidMap();
  map[String(newOrderId)] = oldOrderId;
  storage.set(PREPAID_KEY, JSON.stringify(map));
};

export const getPrepaidOrderIds = (): Set<number> =>
  new Set(Object.keys(readPrepaidMap()).map(Number));
