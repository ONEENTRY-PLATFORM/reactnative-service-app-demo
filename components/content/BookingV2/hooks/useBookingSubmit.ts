import {useState} from 'react';
import {router} from 'expo-router';
import type {
  IOrderData,
  IBaseOrdersEntity,
} from 'oneentry/dist/orders/ordersInterfaces';
import {api} from '@/api/defineApi';
import {
  hideRescheduledOrder,
  markOrderAsPrepaid,
} from '@/lib/rescheduledOrders';
import {useAuth} from '@/state/contexts/AuthContext';
import {
  ORDERS_FORM_IDENTIFIER,
  ORDERS_STORAGE_MARKER,
} from '../orderMarkers';
import {isOnlinePayment} from './useBookingPayment';
import {
  buildOrderFormData,
  buildOrderProducts,
} from '../orderBuilders';
import {toBookingInterval} from '../slotUtils';
import type {
  BookingMaster,
  BookingSalon,
  BookingService,
} from '../types';

// Ported from nextjs-beauty components/layout/booking-page/hooks/
// useBookingSubmit.ts. Same three branches: unauth → open sign-in, all-demo
// → success without POST, real → api.Orders.createOrder + payment routing.
// Reschedule branch uses api.Orders.updateOrder (mobile has this in the SDK).

export interface BookingSelection {
  salon?: BookingSalon | undefined;
  services: BookingService[];
  master?: BookingMaster | undefined;
  date: string;
  time: string;
}

interface UseBookingSubmitInput {
  paymentAccount: string;
  rescheduleOrderId: number | null;
  // When true the previous appointment was already paid online — we route
  // the new order through `cash` so the user is not asked to pay twice.
  // The salon handles the refund/re-application manually.
  rescheduleIsPrepaid: boolean;
}

interface UseBookingSubmitResult {
  submit: (sel: BookingSelection) => Promise<void>;
  booked: boolean;
  closeSuccess: () => void;
  isAuth: boolean;
  isLoading: boolean;
  error: string;
}

const asErrorMessage = (e: any): string => {
  if (!e) return 'Unknown error';
  if (typeof e === 'string') return e;
  if (typeof e?.message === 'string') return e.message;
  return 'Something went wrong';;
};

export const useBookingSubmit = ({
  paymentAccount,
  rescheduleOrderId,
  rescheduleIsPrepaid,
}: UseBookingSubmitInput): UseBookingSubmitResult => {
  const {user} = useAuth();
  const isAuth = Boolean(user);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(false);
  const [realOrder, setRealOrder] = useState(false);

  const submit = async (sel: BookingSelection): Promise<void> => {
    setError('');

    if (!isAuth) {
      // Mobile: no sign-in modal on top of the wizard yet — route to the auth
      // screen so the flow can be resumed after login.
      router.navigate('/auth/sign_in');
      return;
    }

    const products = buildOrderProducts(sel.services);
    if (products.length === 0) {
      setRealOrder(false);
      setBooked(true);
      return;
    }

    // Safety net: the CTA button is gated on a non-empty paymentAccount for
    // multi-option users, but if something unexpected calls submit anyway
    // (deep-link, race), refuse the create rather than post an order with
    // no paymentAccountIdentifier. Skipped for prepaid reschedule which
    // overrides to 'cash' internally.
    if (!rescheduleIsPrepaid && !paymentAccount) {
      setError('Please choose a payment method.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = buildOrderFormData({
        salon: sel.salon,
        master: sel.master,
        interval: toBookingInterval({
          date: sel.date,
          time: sel.time,
          services: sel.services,
        }),
      });

      if (rescheduleOrderId) {
        // Reschedule flow: OneEntry rejects updateOrder for any order with a
        // payment session (paid or pending). The reliable path — that works
        // for cash, pending online, and paid online alike — is:
        //   1) mark the old order canceled
        //   2) fall through to createOrder for the new interval
        //   3) if the user picked an online method, kick off a new session
        // For a genuinely paid appointment this means the previous payment
        // needs a manual refund from the salon; the OrderCard warns the user
        // about that before routing here.
        const current: any = await api.Orders.getOrderByMarkerAndId(
          ORDERS_STORAGE_MARKER,
          rescheduleOrderId,
        );
        if (!current || (current as any).statusCode >= 400) {
          setError((current as any)?.message ?? 'Failed to load the order');
          return;
        }
        const originalProducts = ((current as any).products ?? []).map(
          (p: any) => ({productId: p.id, quantity: p.quantity ?? 1}),
        );
        const cancelBody: IOrderData = {
          ...(current as unknown as IOrderData),
          products: originalProducts.length > 0 ? originalProducts : products,
          statusIdentifier: 'canceled',
        };
        // Best-effort cancel: OneEntry rejects status=canceled for any
        // order with an attached payment session (it can't cancel the
        // session from the client). When that happens, fall back to a
        // refund request — the salon receives it and closes the old
        // order + processes the refund on their side.
        let cancelPaidError = false;
        try {
          const canceled: any = await api.Orders.updateOrderByMarkerAndId(
            ORDERS_STORAGE_MARKER,
            rescheduleOrderId,
            cancelBody,
          );
          if (canceled && canceled.statusCode >= 400) {
            if (/paid|payment/i.test(String(canceled.message ?? ''))) {
              cancelPaidError = true;
            }
            // eslint-disable-next-line no-console
            console.warn(
              '[BookingV2] reschedule: could not cancel old order',
              rescheduleOrderId,
              canceled.message,
            );
          }
        } catch (cancelErr: any) {
          if (/paid|payment/i.test(String(cancelErr?.message ?? ''))) {
            cancelPaidError = true;
          }
          // eslint-disable-next-line no-console
          console.warn(
            '[BookingV2] reschedule: cancel threw',
            rescheduleOrderId,
            cancelErr,
          );
        }
        if (cancelPaidError) {
          try {
            const productsMap = Object.fromEntries(
              originalProducts.map((p: any) => [
                String(p.productId),
                {quantity: p.quantity},
              ]),
            );
            await api.Orders.createRefundRequest(rescheduleOrderId, {
              products: productsMap,
              note: 'Reschedule from the mobile app',
            } as any);
          } catch {
            // Best-effort — the salon will still see the orphan order.
          }
        }
        // Fall through to the create branch below.
      }

      // For a prepaid reschedule the new order is created as "cash" so no
      // Stripe session is spun up — the customer is not asked to pay again.
      const effectivePaymentAccount = rescheduleIsPrepaid
        ? 'cash'
        : paymentAccount;

      const body: IOrderData = {
        formIdentifier: ORDERS_FORM_IDENTIFIER,
        paymentAccountIdentifier: effectivePaymentAccount,
        products,
        formData,
      };

      const created: any = await api.Orders.createOrder(
        ORDERS_STORAGE_MARKER,
        body,
      );
      if (created && created.statusCode >= 400) {
        setError(created.message ?? 'Failed to create the appointment');
        return;
      }
      const createdOrder = created as IBaseOrdersEntity;

      // The new order is now live. If this submit came from reschedule and
      // the old order failed to cancel server-side (Stripe session was
      // holding it), hide it locally so the user doesn't see the ghost
      // next to the new one in visits history.
      if (rescheduleOrderId) {
        hideRescheduledOrder(rescheduleOrderId);
        if (rescheduleIsPrepaid) {
          // Record the pairing so visits history can render this cash
          // order as PAID (its price is already covered by the old order).
          markOrderAsPrepaid(createdOrder.id, rescheduleOrderId);
        }
      }

      if (isOnlinePayment(effectivePaymentAccount)) {
        const session: any = await api.Payments.createSession(
          createdOrder.id,
          'session',
        );
        if (session && session.statusCode >= 400) {
          setError(session.message ?? 'Failed to create the payment session');
          return;
        }
        if (!session?.paymentUrl) {
          setError('Payment session has no paymentUrl');
          return;
        }
        // Open the gateway inside the app via /stripe_payment (WebView). The
        // route polls the payment session id and routes to /confirm_booking
        // when the status becomes `completed`. Using router.replace so back
        // gestures don't return to the booking wizard mid-checkout.
        router.replace({
          pathname: '/stripe_payment',
          params: {
            id: String(session.id),
            orderId: String(createdOrder.id),
            paymentUrl: session.paymentUrl,
          },
        });
        return;
      }

      setRealOrder(true);
      setBooked(true);
    } catch (err) {
      setError(asErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const closeSuccess = (): void => {
    setBooked(false);
    if (realOrder) {
      // After a reschedule the user cares about the moved appointment, not
      // their profile card — route them to the appointments list.
      router.push(
        rescheduleOrderId ? '/(tabs)/visits_history' : '/(tabs)/profile',
      );
    }
  };

  return {submit, booked, closeSuccess, isAuth, isLoading, error};
};
