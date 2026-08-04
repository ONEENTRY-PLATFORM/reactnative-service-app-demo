import {useState} from 'react';
import type {IAccountsEntity} from 'oneentry/dist/payments/paymentsInterfaces';
import {useAuth} from '@/state/contexts/AuthContext';
import {useGetAccountsQuery} from '@/api';
import {ONLINE_PAYMENT_ACCOUNTS} from '../orderMarkers';

// Ported from nextjs-beauty components/layout/booking-page/hooks/
// useBookingPayment.ts. Diverges from web: mobile does NOT default to cash
// when the user has multiple options — the CTA is gated on an empty
// paymentAccount so an implicit cash booking is impossible.

const isOnlinePayment = (identifier: string): boolean =>
  ONLINE_PAYMENT_ACCOUNTS.includes(identifier);

export interface BookingPaymentState {
  paymentAccounts: IAccountsEntity[];
  paymentAccount: string;
  selectPaymentAccount: (identifier: string) => void;
}

export const useBookingPayment = (): BookingPaymentState => {
  const {user} = useAuth();
  const isAuth = Boolean(user);
  const {data} = useGetAccountsQuery({}, {skip: !isAuth});
  const paymentAccounts = (data as IAccountsEntity[]) ?? [];
  const [paymentAccount, setPaymentAccount] = useState('');

  // Auto-select only when there is exactly ONE option — no picker to show,
  // no choice to make. Zero and multi-option cases return '' so callers
  // must gate the submit button.
  const soleOption =
    paymentAccounts.length === 1 ? paymentAccounts[0]?.identifier : '';

  return {
    paymentAccounts,
    paymentAccount: paymentAccount || soleOption || '',
    selectPaymentAccount: setPaymentAccount,
  };
};

export {isOnlinePayment};
