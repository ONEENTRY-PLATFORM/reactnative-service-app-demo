import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  RefreshCcw,
  Scissors,
  User,
  X,
} from 'lucide-react-native';
import type {
  IOrderByMarkerEntity,
  IOrderData,
} from 'oneentry/dist/orders/ordersInterfaces';
import {router, useFocusEffect} from 'expo-router';
import {useGetSessionByOrderIdQuery, useGetUserOrdersQuery} from '@/api';
import {api} from '@/api/defineApi';
import {Screen} from '@/components/shared/Screen';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {useAuth} from '@/state/contexts/AuthContext';
import {isOnlinePayment as isOnlinePaymentMethod} from '@/components/content/BookingV2/hooks/useBookingPayment';
import {
  getHiddenRescheduledOrderIds,
  getPrepaidOrderIds,
  hideRescheduledOrder,
} from '@/lib/rescheduledOrders';
import {setBookingPrefill} from '@/state/reducers/BookingPrefillSlice';

// Mobile visits history — mirrors the web ProfileHistory layout: three
// collapsible sections (Upcoming / Completed / Canceled) with per-order
// cards below the section header. Upcoming opens expanded by default
// (same as web `defaultOpen`).

const PINK = '#ed21f1';

type Bucket = 'upcoming' | 'completed' | 'canceled';

const TITLES: Record<Bucket, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  canceled: 'Canceled',
};

const STATUS_KEY: Record<Bucket, string[]> = {
  // CMS `statusIdentifier` values — same buckets as the web page.
  upcoming: ['upcoming'],
  completed: ['completed', 'done', 'success'],
  canceled: ['canceled', 'cancelled', 'rejected'],
};

const bucketOf = (status: string | undefined): Bucket => {
  const s = (status ?? '').toLowerCase();
  for (const key of Object.keys(STATUS_KEY) as Bucket[]) {
    if (STATUS_KEY[key].some(v => s.includes(v))) return key;
  }
  return 'upcoming';
};

const readField = (
  order: IOrderByMarkerEntity,
  marker: string,
): string | number[] | undefined => {
  const entry = order.formData?.find((f: any) => f.marker === marker) as
    | {value?: any}
    | undefined;
  return entry?.value;
};

const formatInterval = (raw: any): string => {
  // Accept every shape OneEntry has been seen to return:
  //   [[startISO, endISO]]            — canonical
  //   [startISO, endISO]              — single-pair variant
  //   {value: [[startISO, endISO]]}   — occasionally wrapped
  //   startISO                        — bare string
  let iso: string | undefined;
  if (typeof raw === 'string') {
    iso = raw;
  } else if (Array.isArray(raw)) {
    const first = raw[0];
    iso = Array.isArray(first) ? first[0] : first;
  } else if (raw && typeof raw === 'object' && Array.isArray(raw.value)) {
    const first = raw.value[0];
    iso = Array.isArray(first) ? first[0] : first;
  }
  if (typeof iso !== 'string') return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dateStr = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dateStr} · ${hh}:${mm}`;
};

export default function VisitsHistoryScreen() {
  const dict = useAppSelector(state => state.SystemContentReducer.content) ?? {};
  const salons = useAppSelector(state => state.SalonsReducer.salons);
  const masters = useAppSelector(state => state.MastersReducer.masters);

  const {user} = useAuth();
  const {data, isLoading, refetch} = useGetUserOrdersQuery(
    {marker: 'orders'},
    {skip: !user},
  );

  // Locally hidden order ids (server refused to cancel because of a Stripe
  // session, or the user rescheduled away from it). Seeded from MMKV, then
  // mutated in-place via `hideOrder` so the buckets recompute instantly —
  // we can't rely on RTK refetch to trigger a rerender because the API
  // returns the same order and the array reference doesn't change.
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(
    () => getHiddenRescheduledOrderIds(),
  );
  // Orders created via the "prepaid reschedule" path: they were POSTed as
  // cash so the user isn't billed twice, but visits history should render
  // them as PAID (the previous, already-paid, order covers this one).
  const [prepaidIds, setPrepaidIds] = useState<Set<number>>(
    () => getPrepaidOrderIds(),
  );
  const hideOrder = useCallback((id: number) => {
    hideRescheduledOrder(id);
    setHiddenIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Refetch on every focus — the query is user-scoped and RTK caches the
  // first empty response, so without this a booking made in the same
  // session doesn't show up here until a full reload. Also re-read the
  // MMKV hidden-ids: the wizard mutates that store when a reschedule
  // succeeds, but our local `hiddenIds` state is init-once so we have to
  // sync it here.
  useFocusEffect(
    useCallback(() => {
      if (user) refetch();
      setHiddenIds(getHiddenRescheduledOrderIds());
      setPrepaidIds(getPrepaidOrderIds());
    }, [user, refetch]),
  );
  const orders: IOrderByMarkerEntity[] = (data as any)?.items ?? [];

  const buckets = useMemo(() => {
    const b: Record<Bucket, IOrderByMarkerEntity[]> = {
      upcoming: [],
      completed: [],
      canceled: [],
    };
    orders.forEach(o => {
      const key = bucketOf(o.statusIdentifier);
      // Only suppress `upcoming` orders — the local hidden list means
      // "the user asked to cancel/reschedule this and we don't want it
      // hanging around as active". Once the server processes it as
      // `canceled`/`completed` it belongs in the matching bucket.
      if (key === 'upcoming' && hiddenIds.has(o.id)) return;
      b[key].push(o);
    });
    return b;
  }, [orders, hiddenIds]);

  const [open, setOpen] = useState<Record<Bucket, boolean>>({
    upcoming: true,
    completed: false,
    canceled: false,
  });

  return (
    <Screen isFull edges={['horizontal']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding: 16, paddingBottom: 120, gap: 12}}>
        <View style={styles.card}>
          <Paragraph size={20} weight={'400'} color={'charcoal'}>
            {(dict.history_of_visits_text as string) || 'History of visits'}
          </Paragraph>
        </View>

        {isLoading ? (
          <View style={{padding: 32, alignItems: 'center'}}>
            <ActivityIndicator size={'large'} color={PINK} />
          </View>
        ) : (
          (Object.keys(TITLES) as Bucket[]).map(key => (
            <View key={key} style={styles.card}>
              <TouchableOpacity
                onPress={() => setOpen(v => ({...v, [key]: !v[key]}))}
                activeOpacity={0.7}
                style={styles.sectionHeader}>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                  <Paragraph size={15} weight={'700'} color={'charcoal'}>
                    {TITLES[key]}
                  </Paragraph>
                  <View style={styles.badge}>
                    <Paragraph size={11} weight={'700'} color={'white'}>
                      {buckets[key].length}
                    </Paragraph>
                  </View>
                </View>
                {open[key] ? (
                  <ChevronUp size={18} color={appColors.gray} />
                ) : (
                  <ChevronDown size={18} color={appColors.gray} />
                )}
              </TouchableOpacity>

              {open[key] ? (
                buckets[key].length === 0 ? (
                  <Paragraph size={13} color={'gray'}>
                    {key === 'upcoming'
                      ? 'No upcoming visits yet.'
                      : key === 'completed'
                        ? 'No completed visits yet.'
                        : 'No canceled visits.'}
                  </Paragraph>
                ) : (
                  <View style={{gap: 10, marginTop: 8}}>
                    {buckets[key].map(o => (
                      <OrderCard
                        key={o.id}
                        order={o}
                        bucket={key}
                        salons={salons}
                        masters={masters}
                        onRefetch={() => refetch()}
                        onHide={hideOrder}
                        isPrepaid={prepaidIds.has(o.id)}
                      />
                    ))}
                  </View>
                )
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const OrderCard: React.FC<{
  order: IOrderByMarkerEntity;
  bucket: Bucket;
  salons: any[];
  masters: any[];
  onRefetch: () => void;
  onHide: (orderId: number) => void;
  isPrepaid: boolean;
}> = ({order, bucket, salons, masters, onRefetch, onHide, isPrepaid}) => {
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState<'cancel' | 'pay' | null>(null);

  const salonValue = readField(order, 'salon') as number[] | undefined;
  const masterValue = readField(order, 'master') as
    | (string | number)[]
    | undefined;
  const intervalValue = readField(order, 'interval');

  const salon = salons.find(s => s.id === salonValue?.[0]);
  const masterId = Number(masterValue?.[0]);
  const master = masters.find((m: any) => m.id === masterId);

  const when = formatInterval(intervalValue);
  const services =
    (order as any).products
      ?.map((p: any) => p.title ?? p.name)
      .filter(Boolean) ?? [];

  const totalSum = String(order.totalSum ?? '').trim();
  const currency = String((order as any).currency ?? '').trim();
  const paymentAccount = String((order as any).paymentAccountIdentifier ?? '');
  const paymentTitle =
    (order as any).paymentAccountLocalizeInfos?.title ?? paymentAccount;
  // Whitelist via shared helper — matches what useBookingSubmit uses to
  // decide whether to createSession. A blacklist (!== 'cash') would
  // classify an offline "bank_transfer" account as online and trigger a
  // PAY button + createSession that the server would reject.
  const isOnlinePayment = isOnlinePaymentMethod(paymentAccount);

  // Fetch payment sessions for this order to know if it's already paid.
  // RTK caches per-orderId so this is a single request per card.
  const {data: sessions, isLoading: sessionsLoading} =
    useGetSessionByOrderIdQuery({orderId: order.id}, {skip: !isOnlinePayment});
  const sessionList = Array.isArray(sessions)
    ? sessions
    : sessions
      ? [sessions]
      : [];
  // Until the sessions query resolves, we don't know the true payment state.
  // Treating an unresolved online order as "not paid" would flash the PAY
  // button for a moment on genuinely paid orders — avoid that by gating on
  // `paymentStateKnown`.
  const paymentStateKnown = !isOnlinePayment || sessions !== undefined;
  // `isPaid` means "money has been received via the app":
  //  - online orders with a completed payment session, OR
  //  - orders created via prepaid reschedule (their price is covered by a
  //    previously paid order that has been hidden from the list).
  // Cash orders otherwise are settled at the salon → no PAID badge.
  const isPaid =
    isPrepaid ||
    (isOnlinePayment &&
      sessionList.some(
        (s: any) =>
          String(s?.status ?? '').toLowerCase() === 'completed' ||
          String(s?.status ?? '').toLowerCase() === 'paid' ||
          String(s?.status ?? '').toLowerCase() === 'succeeded',
      ));

  // OneEntry rejects updateOrder if the order has ANY payment session — not
  // just a completed one. A pending session ("Payment sessions N could not
  // be canceled") also blocks moves. So the wizard flow for reschedule of a
  // session-holding order is cancel-old + create-new (see useBookingSubmit).
  const hasPaymentSession = isOnlinePayment && sessionList.length > 0;

  const goToWizard = (prepaid: boolean = false) => {
    dispatch(
      setBookingPrefill({
        masterAdminId: masterId || null,
        salonId: salonValue?.[0] ?? null,
      }),
    );
    router.navigate({
      pathname: '/(tabs)/booking',
      params: {
        reschedule: String(order.id),
        ...(prepaid ? {prepaid: '1'} : {}),
      },
    });
  };

  const onReschedule = () => {
    if (sessionsLoading) return;
    // Prepaid-carrying orders (either an original paid Stripe order, or a
    // reschedule of one which was created as cash but carries a prepaid
    // pairing in MMKV) should never ask the user to pay again — route
    // through the prepaid wizard branch.
    if ((isPaid && isOnlinePayment) || isPrepaid) {
      Alert.alert(
        'Reschedule paid appointment?',
        'The previous payment will cover the new time. The salon will confirm the change on their side.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Continue', onPress: () => goToWizard(true)},
        ],
      );
      return;
    }
    if (hasPaymentSession) {
      // Pending session: user started but never completed checkout. We can
      // safely cancel the old order and create+pay the new one.
      Alert.alert(
        'Continue rescheduling?',
        'The previous payment attempt will be canceled and you will be asked to pay for the new time.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Continue', onPress: () => goToWizard(false)},
        ],
      );
      return;
    }
    goToWizard(false);
  };

  const onPay = async () => {
    // Resume checkout for an orphaned online order (session never completed
    // or the user closed Stripe mid-flow). Creates a fresh session and hands
    // it to the in-app WebView so we don't leave the app.
    setBusy('pay');
    try {
      const session: any = await api.Payments.createSession(order.id, 'session');
      if (session?.statusCode >= 400 || !session?.paymentUrl) {
        Alert.alert(
          'Payment failed',
          session?.message ?? 'Could not start the payment session.',
        );
        return;
      }
      router.navigate({
        pathname: '/stripe_payment',
        params: {
          id: String(session.id),
          orderId: String(order.id),
          paymentUrl: session.paymentUrl,
        },
      });
    } catch (e: any) {
      Alert.alert('Payment failed', e?.message ?? 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const onCancel = () => {
    const paidBranch = isPaid && isOnlinePayment;
    const confirmMsg = paidBranch
      ? 'This appointment has been paid. A refund request will be sent to the salon and the appointment will be removed from your list.'
      : 'This will free up the time slot. Are you sure?';
    Alert.alert(
      'Cancel this appointment?',
      confirmMsg,
      [
        {text: 'Keep', style: 'cancel'},
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: async () => {
            setBusy('cancel');
            try {
              // Try the plain status update first — succeeds for cash and
              // for orders that have no payment session attached.
              // `statusIdentifier` is accepted by the endpoint but not
              // declared on IOrderData — see useBookingSubmit.
              const body: IOrderData & {statusIdentifier: string} = {
                ...(order as unknown as IOrderData),
                products: ((order as any).products ?? []).map((p: any) => ({
                  productId: p.id,
                  quantity: p.quantity ?? 1,
                })),
                statusIdentifier: 'canceled',
              };
              let serverCanceled = false;
              let paidErrorMsg = '';
              try {
                const res: any = await api.Orders.updateOrderByMarkerAndId(
                  'orders',
                  order.id,
                  body,
                );
                // Successful updateOrder returns the refreshed order entity
                // (no `statusCode` field). An error returns `{statusCode,
                // message}` — that's the only case we treat as failure.
                const hasError =
                  res &&
                  typeof res.statusCode === 'number' &&
                  res.statusCode >= 400;
                if (!hasError) {
                  serverCanceled = true;
                } else if (/paid|payment/i.test(String(res.message ?? ''))) {
                  paidErrorMsg = String(res.message);
                }
              } catch (e: any) {
                if (/paid|payment/i.test(String(e?.message ?? ''))) {
                  paidErrorMsg = String(e.message);
                }
              }

              // Paid order: server refused the direct cancel because the
              // Stripe session can't be voided from the client. The refund
              // request endpoint is what the server accepts in that case —
              // salon staff sees it and processes the refund + cancels the
              // order on their side.
              if (!serverCanceled && paidErrorMsg) {
                try {
                  const productsMap = Object.fromEntries(
                    ((order as any).products ?? []).map((p: any) => [
                      String(p.id),
                      {quantity: p.quantity ?? 1},
                    ]),
                  );
                  await api.Orders.createRefundRequest(order.id, {
                    products: productsMap,
                    note: 'Cancellation requested from the mobile app',
                  } as any);
                } catch {
                  // Best-effort: if refund request also fails the salon
                  // still gets the abandoned order and can act on it.
                }
              }

              if (serverCanceled) {
                onRefetch();
              } else {
                // Hide locally regardless — the user asked to cancel.
                onHide(order.id);
              }
            } finally {
              setBusy(null);
            }
          },
        },
      ],
    );
  };


  const showActions = bucket === 'upcoming';

  return (
    <View style={styles.orderCard}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View style={styles.row}>
          <Calendar size={14} color={PINK} />
          <Paragraph size={13} weight={'700'} color={'charcoal'}>
            {when || 'Time TBD'}
          </Paragraph>
        </View>
        <Paragraph size={11} color={'gray'}>
          #{order.id}
        </Paragraph>
      </View>
      {master ? (
        <View style={styles.row}>
          <User size={14} color={appColors.gray} />
          <Paragraph size={13} color={'ink'} numberOfLines={1}>
            {master.attributeValues?.master_name?.value ?? 'Specialist'}
          </Paragraph>
        </View>
      ) : null}
      {salon ? (
        <View style={styles.row}>
          <MapPin size={14} color={appColors.gray} />
          <Paragraph size={13} color={'ink'} numberOfLines={1}>
            {(salon.localizeInfos?.title as string) || 'Studio'}
          </Paragraph>
        </View>
      ) : null}
      {services.length > 0 ? (
        <View style={styles.row}>
          <Scissors size={14} color={appColors.gray} />
          <Paragraph
            size={13}
            color={'ink'}
            numberOfLines={2}
            style={{flex: 1}}>
            {services.join(', ')}
          </Paragraph>
        </View>
      ) : null}

      {/* Price + payment */}
      <View style={styles.priceRow}>
        {totalSum ? (
          <View style={styles.totalPill}>
            <Paragraph size={13} weight={'700'} style={{color: PINK}}>
              {totalSum} {currency || 'AED'}
            </Paragraph>
          </View>
        ) : null}
        {paymentTitle ? (
          <View style={styles.paymentRow}>
            <CreditCard size={12} color={appColors.gray} />
            <Paragraph size={11} color={'gray'}>
              {isPrepaid ? 'Prepaid' : paymentTitle}
            </Paragraph>
            {paymentStateKnown && isPaid ? (
              <View style={styles.paidBadge}>
                <Paragraph size={10} weight={'700'} color={'white'}>
                  PAID
                </Paragraph>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {showActions ? (
        <View style={styles.actionsCol}>
          {isOnlinePayment && paymentStateKnown && !isPaid ? (
            <TouchableOpacity
              onPress={onPay}
              activeOpacity={0.9}
              disabled={busy !== null}
              style={styles.payBtn}>
              <LinearGradient
                colors={['#f60efb', '#ed21f1']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={StyleSheet.absoluteFill}
              />
              {busy === 'pay' ? (
                <ActivityIndicator size={'small'} color={appColors.white} />
              ) : (
                <>
                  <CreditCard size={14} color={appColors.white} />
                  <Paragraph
                    size={12}
                    weight={'700'}
                    color={'white'}
                    style={{textTransform: 'uppercase', letterSpacing: 1}}>
                    Pay {totalSum} {currency || 'AED'}
                  </Paragraph>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={onReschedule}
            activeOpacity={0.85}
            disabled={busy !== null}
            style={styles.rescheduleBtn}>
            <RefreshCcw size={13} color={PINK} />
            <Paragraph
              size={12}
              weight={'700'}
              style={{color: PINK, textTransform: 'uppercase', letterSpacing: 1}}>
              Reschedule
            </Paragraph>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onCancel}
            activeOpacity={0.85}
            disabled={busy !== null}
            style={styles.cancelBtn}>
            {busy === 'cancel' ? (
              <ActivityIndicator size={'small'} color={appColors.gray} />
            ) : (
              <>
                <X size={13} color={appColors.gray} />
                <Paragraph
                  size={12}
                  weight={'700'}
                  color={'gray'}
                  style={{textTransform: 'uppercase', letterSpacing: 1}}>
                  Cancel
                </Paragraph>
              </>
            )}
          </TouchableOpacity>
        </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: appColors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: appColors.slate150,
    shadowColor: PINK,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PINK,
  },
  orderCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  totalPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: `${PINK}14`,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paidBadge: {
    marginLeft: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#25D4A0',
  },
  actionsCol: {
    marginTop: 8,
    gap: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    // No flexWrap on purpose — with wrap+minWidth the buttons stacked
    // vertically on cards that were slightly narrower than others.
  },
  payBtn: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 12,
    shadowColor: PINK,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  rescheduleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: PINK,
    backgroundColor: appColors.white,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
  },
});
