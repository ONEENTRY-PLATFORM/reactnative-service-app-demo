// Ported from nextjs-beauty/app/store/orderMarkers.ts. Same markers configured
// in the OneEntry admin panel, so a rename there is a one-line change here.
// The three form fields ORDER_FIELD_* mirror the `order` form's attribute set
// (verified via POST — the public attribute listing disagrees; the set wins).

export const ORDERS_STORAGE_MARKER = 'orders';
export const ORDERS_FORM_IDENTIFIER = 'order';

export const ORDER_FIELD_MASTER = 'master';
export const ORDER_FIELD_SALON = 'salon';
export const ORDER_FIELD_INTERVAL = 'interval';

export const ORDERS_STATUS_UPCOMING = 'upcoming';
export const ORDERS_STATUS_COMPLETED = 'completed';
export const ORDERS_STATUS_CANCELED = 'canceled';

export const PAYMENT_ACCOUNT_CASH = 'cash';
export const ONLINE_PAYMENT_ACCOUNTS: readonly string[] = ['stripe'];
