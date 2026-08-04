import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Image as ExpoImage} from 'expo-image';
import {LinearGradient} from 'expo-linear-gradient';
import {ChevronDown, ChevronRight, MapPin, Star, X} from 'lucide-react-native';
import {router} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {IProductsEntity} from 'oneentry/dist/products/productsInterfaces';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {MUTED, PINK} from './constants';
import {useBookingData} from './useBookingData';
import {isOnlinePayment, useBookingPayment} from './hooks/useBookingPayment';
import {useBookingSubmit} from './hooks/useBookingSubmit';
import {
  dayCloseMinutes,
  daySlots,
  slotFits,
  slotMinutes,
  todayDateKey,
} from './slotUtils';
import {entityLinks, entityProductIds} from './cmsUtils';
import {FALLBACK_CLOSE_MINUTES, TIMES} from './constants';
import type {BookingMaster, BookingSalon, BookingService} from './types';
import SuccessModal from './ui/SuccessModal';
import MonthCalendar from './ui/MonthCalendar';
import PaymentMethodPicker from './ui/PaymentMethodPicker';

// Single-screen booking view for offers — matches the design in the user's
// screenshots: sticky offer header + service tabs + LOCATION / SPECIALIST /
// DATE & TIME sections stacked + CONTINUE button. Reuses useBookingData for
// CMS reads and useBookingSubmit for the actual order creation, so nothing
// about the data layer forks from the main wizard.

interface Props {
  visible: boolean;
  onClose: () => void;
  // The offer product — carries name, currency, offer_price / offer_sale and
  // offer_services (entity link to bundled services).
  offer: IProductsEntity;
  // Accent colour taken from the offer card (parseOffer → accentColor/light)
  // so the modal keeps the card's tone instead of a fixed brand pink.
  accentColor: string;
  accentLight: string;
}

interface OfferService {
  // Title from offer_services entity link — always present.
  title: string;
  // Product id when the link is a product ref (`p-{pageId}-{productId}`).
  productId: number | undefined;
}

const parseOfferMeta = (offer: IProductsEntity) => {
  const attrs: any = offer.attributeValues ?? {};
  const name = (offer.localizeInfos?.title as string) ?? '';
  const price = Number(attrs.offer_sale?.value) || Number(offer.price) || 0;
  const original = Number(attrs.offer_price?.value) || 0;
  const currency =
    (typeof attrs.currency?.value === 'string' && attrs.currency.value) || 'AED';
  const rawServices = attrs.offer_services?.value;
  const links = entityLinks(rawServices);
  const bundled: OfferService[] = links
    .filter(l => l.title)
    .map(l => ({
      title: l.title,
      productId:
        typeof l.id === 'string' && l.id.startsWith('p-')
          ? Number(l.id.split('-')[2]) || undefined
          : undefined,
    }));

  // offer_type points at a category entity (Hair / Face / Body / Nails). Web's
  // wizard uses this as `categoryFilter` and forces every eligible master to
  // have at least one service in that category.
  const typeEntry: any = Array.isArray(attrs.offer_type?.value)
    ? attrs.offer_type.value[0]
    : undefined;
  const category =
    typeof typeEntry?.title === 'string' ? typeEntry.title.trim() : '';

  return {name, price, original, currency, bundled, category};
};

const OfferBookingScreen: React.FC<Props> = ({
  visible,
  onClose,
  offer,
  accentColor,
  accentLight,
}) => {
  const insets = useSafeAreaInsets();
  const meta = useMemo(() => parseOfferMeta(offer), [offer]);
  const {data, loading} = useBookingData();

  // Local wizard state — the offer flow doesn't use the full reducer; every
  // section reads/writes here directly. Cross-filter is minimal: on service
  // switch we narrow the master list to those who perform it.
  const [activeIdx, setActiveIdx] = useState(0);
  const [salonId, setSalonId] = useState<number | null>(null);
  const [masterId, setMasterId] = useState<string | null>(null);
  const [datePref, setDatePref] = useState<'today' | 'tomorrow' | 'pick'>(
    'today',
  );
  const [pickedDate, setPickedDate] = useState<string>(todayDateKey());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [time, setTime] = useState<string>('');

  // Reset state every time the modal is (re)opened.
  useEffect(() => {
    if (!visible) return;
    setActiveIdx(0);
    setSalonId(null);
    setMasterId(null);
    setDatePref('today');
    setPickedDate(todayDateKey());
    setTime('');
    setCalendarOpen(false);
  }, [visible]);

  const activeOffer = meta.bundled[activeIdx] ?? meta.bundled[0];

  // Resolve the active offer service to a catalog service when possible.
  // Match by productId first, then fall back to a case-insensitive title
  // match against data.services — some CMS setups link offer_services to
  // pages, not products, so `productId` is often undefined.
  const activeService: BookingService | undefined = useMemo(() => {
    if (!data || !activeOffer) return undefined;
    if (activeOffer.productId) {
      const byId = data.services.find(s => s.productId === activeOffer.productId);
      if (byId) return byId;
    }
    const tl = activeOffer.title.trim().toLowerCase();
    return data.services.find(s => s.name.trim().toLowerCase() === tl);
  }, [data, activeOffer]);

  const availableSalons: BookingSalon[] = data?.salons ?? [];

  // Default salon: first available.
  useEffect(() => {
    if (salonId !== null || availableSalons.length === 0) return;
    setSalonId(availableSalons[0]!.id);
  }, [availableSalons, salonId]);

  const selectedSalon = availableSalons.find(s => s.id === salonId);

  // Masters that work at the chosen salon AND perform the active service AND
  // have at least one service in the offer's category. The category filter is
  // what keeps Hair specialists out of a Body offer — same rule as the web's
  // useBookingFilters (categoryFilter + serviceIds double-check).
  const eligibleMasters: BookingMaster[] = useMemo(() => {
    if (!data) return [];
    const titleLc = activeOffer?.title?.trim().toLowerCase();
    const categoryLc = meta.category.toLowerCase();
    return data.masters.filter(m => {
      // 1. Salon
      if (
        salonId &&
        m.salonIds.length > 0 &&
        !m.salonIds.includes(salonId)
      ) {
        return false;
      }
      // 2. Category — a master without any service link stays visible, same
      //    as the web fallback ("no restriction when master has no links").
      if (categoryLc && m.serviceIds.length > 0) {
        const inCategory = m.serviceIds.some(sid => {
          const sv = data.services.find(x => x.id === sid);
          return sv?.category?.trim().toLowerCase() === categoryLc;
        });
        if (!inCategory) return false;
      }
      // 3. Service — match by resolved catalog id first, then by title.
      if (activeService && m.serviceIds.length > 0) {
        return m.serviceIds.includes(activeService.id);
      }
      if (titleLc && m.serviceIds.length > 0) {
        const titles = m.serviceIds
          .map(sid =>
            data.services.find(s => s.id === sid)?.name?.trim().toLowerCase(),
          )
          .filter((t): t is string => Boolean(t));
        return titles.includes(titleLc);
      }
      return true;
    });
  }, [data, salonId, activeService, activeOffer, meta.category]);

  // Default master: first eligible.
  useEffect(() => {
    if (masterId !== null || eligibleMasters.length === 0) return;
    setMasterId(eligibleMasters[0]!.id);
  }, [eligibleMasters, masterId]);

  const selectedMaster = eligibleMasters.find(m => m.id === masterId);

  // Date resolution: TODAY → todayDateKey; TOMORROW → +1 day; PICK → pickedDate.
  const dateKey = useMemo(() => {
    if (datePref === 'today') return todayDateKey();
    if (datePref === 'tomorrow') {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      return `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
    }
    return pickedDate;
  }, [datePref, pickedDate]);

  // Slots: master.schedule → salon.schedule → fallback static grid.
  const daySchedule = selectedMaster?.schedule ?? selectedSalon?.schedule;
  const slots = useMemo(
    () => (daySchedule ? daySlots(daySchedule, dateKey) : TIMES),
    [daySchedule, dateKey],
  );
  const closeMinutes = daySchedule
    ? dayCloseMinutes(daySchedule, dateKey)
    : FALLBACK_CLOSE_MINUTES;
  const durationMinutes = activeService?.durationMinutes ?? 60;

  const today = new Date();
  const todayKey = todayDateKey();
  const nowMinutes =
    dateKey === todayKey ? today.getHours() * 60 + today.getMinutes() : -1;

  const payment = useBookingPayment();
  const {submit, booked, closeSuccess, isAuth, isLoading, error} =
    useBookingSubmit({
      paymentAccount: payment.paymentAccount,
      rescheduleOrderId: null,
      rescheduleIsPrepaid: false,
    });
  // Reflect the current payment choice on the CTA so the user doesn't
  // silently book cash when they meant to pay online — the picker itself
  // can be missed on a long scroll.
  // Use the shared whitelist rather than hardcoded 'stripe' — new online
  // providers (e.g. 'stripe_uae') get picked up automatically once added
  // to ONLINE_PAYMENT_ACCOUNTS instead of silently falling back to CASH.
  const willPayOnline = isOnlinePayment(payment.paymentAccount);
  const accountsLoading = isAuth && payment.paymentAccounts.length === 0;
  const ctaLabel = !isAuth
    ? 'SIGN IN TO CONTINUE'
    : accountsLoading
      ? 'LOADING PAYMENT METHODS…'
      : !payment.paymentAccount
        ? 'CHOOSE PAYMENT METHOD'
        : willPayOnline
          ? `PAY ${meta.price} ${meta.currency}`
          : `BOOK · CASH ${meta.price} ${meta.currency}`;

  const canContinue =
    !!selectedSalon &&
    !!selectedMaster &&
    !!activeService &&
    !!time &&
    // With 2+ payment accounts we require an explicit pick (no silent
    // default). With a single account it's auto-selected — so a non-empty
    // paymentAccount is always required.
    !!payment.paymentAccount;

  const onContinue = () => {
    // Unauthenticated: close the modal first (so the auth screen isn't
    // hidden behind it) and open the sign-in flow. The user can reopen the
    // offer after logging in.
    if (!isAuth) {
      onClose();
      // Defer navigation until after the Modal has started dismissing so
      // expo-router doesn't try to push a screen behind a live overlay.
      setTimeout(() => router.navigate('/auth/sign_in'), 0);
      return;
    }
    if (!canContinue || !activeService) return;
    void submit({
      salon: selectedSalon,
      services: [activeService],
      master: selectedMaster,
      date: dateKey,
      time,
    });
  };

  const closeAll = () => {
    closeSuccess();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={'slide'}
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* HEADER — gradient with title, close, price, service tabs.
              Colors are taken from the offer card (accentColor / accentLight)
              so the modal keeps the card's tone. */}
          <LinearGradient
            colors={[accentLight, accentColor]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[styles.header, {paddingTop: insets.top + 12}]}>
            <View style={styles.headerRow}>
              <View style={{flex: 1}}>
                <Paragraph
                  size={22}
                  weight={'700'}
                  color={'white'}
                  numberOfLines={2}>
                  {meta.name}
                </Paragraph>
              </View>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.85}
                style={styles.closeBtn}>
                <X size={18} color={appColors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.priceRow}>
              <Paragraph
                family={'league-gothic'}
                size={44}
                color={'white'}
                style={{letterSpacing: 0.5, lineHeight: 46}}>
                {meta.price}
              </Paragraph>
              <View style={{marginLeft: 8, marginBottom: 4}}>
                <Paragraph size={13} color={'white'}>
                  {meta.currency}
                </Paragraph>
                {meta.original > 0 ? (
                  <Paragraph
                    size={12}
                    color={'white'}
                    style={{
                      textDecorationLine: 'line-through',
                      opacity: 0.7,
                    }}>
                    {meta.original}
                  </Paragraph>
                ) : null}
              </View>
            </View>

            {meta.bundled.length > 0 ? (
              <View style={styles.tabRow}>
                {meta.bundled.map((s, i) => {
                  const active = i === activeIdx;
                  return (
                    <TouchableOpacity
                      key={`${s.title}-${i}`}
                      onPress={() => {
                        setActiveIdx(i);
                        setMasterId(null);
                        setTime('');
                      }}
                      activeOpacity={0.85}
                      style={[
                        styles.tabBtn,
                        active && styles.tabBtnActive,
                      ]}>
                      <Paragraph
                        size={12}
                        weight={'700'}
                        style={{
                          color: active ? accentColor : appColors.white,
                          letterSpacing: 0.4,
                        }}
                        numberOfLines={1}>
                        {s.title}
                      </Paragraph>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </LinearGradient>

          {/* BODY — sections stacked */}
          {loading || !data ? (
            <View style={styles.loading}>
              <ActivityIndicator size={'large'} color={PINK} />
            </View>
          ) : (
            <ScrollView
              style={{flex: 1}}
              contentContainerStyle={{padding: 16, gap: 20, paddingBottom: 24}}
              showsVerticalScrollIndicator={false}>
              {/* LOCATION */}
              <Section title={'Location'}>
                <SalonRow
                  salons={availableSalons}
                  selectedId={salonId}
                  onSelect={id => {
                    setSalonId(id);
                    setMasterId(null);
                    setTime('');
                  }}
                  accentColor={accentColor}
                />
              </Section>

              {/* SPECIALIST */}
              <Section title={'Specialist'}>
                {eligibleMasters.length === 0 ? (
                  <Paragraph size={13} color={'gray'}>
                    No specialists for this service at this studio.
                  </Paragraph>
                ) : (
                  <MasterRowsPicker
                    masters={eligibleMasters}
                    selectedId={masterId}
                    onSelect={id => {
                      setMasterId(id);
                      setTime('');
                    }}
                    currency={activeService?.currency ?? meta.currency}
                    accentColor={accentColor}
                  />
                )}
              </Section>

              {/* DATE & TIME */}
              <Section title={'Date & Time'}>
                <View style={styles.dateTabsRow}>
                  {(['today', 'tomorrow', 'pick'] as const).map(pref => {
                    const active = datePref === pref;
                    const label =
                      pref === 'today'
                        ? 'TODAY'
                        : pref === 'tomorrow'
                          ? 'TOMORROW'
                          : 'PICK DATE';
                    return (
                      <TouchableOpacity
                        key={pref}
                        onPress={() => {
                          setDatePref(pref);
                          setTime('');
                          if (pref === 'pick') setCalendarOpen(true);
                        }}
                        activeOpacity={0.85}
                        style={[
                          styles.dateTab,
                          active && {
                            backgroundColor: accentColor,
                            borderColor: accentColor,
                          },
                        ]}>
                        <Paragraph
                          size={11}
                          weight={'700'}
                          style={{
                            color: active ? appColors.white : MUTED,
                            letterSpacing: 1,
                          }}>
                          {label}
                        </Paragraph>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {datePref === 'pick' && calendarOpen ? (
                  <MonthCalendar
                    today={today}
                    todayKey={todayKey}
                    selectedDate={pickedDate}
                    onDate={d => {
                      setPickedDate(d);
                      setCalendarOpen(false);
                    }}
                  />
                ) : null}

                <View style={styles.slotGrid}>
                  {slots.length === 0 ? (
                    <Paragraph size={13} color={'gray'}>
                      No times on this day. Pick another date.
                    </Paragraph>
                  ) : (
                    slots.map(t => {
                      const active = t === time;
                      const unavailable =
                        slotMinutes(t) <= nowMinutes ||
                        !slotFits(t, durationMinutes, closeMinutes);
                      return (
                        <TouchableOpacity
                          key={t}
                          disabled={unavailable}
                          onPress={() => setTime(t)}
                          activeOpacity={0.85}
                          style={[
                            styles.slot,
                            active && {
                              backgroundColor: accentColor,
                              borderColor: accentColor,
                            },
                            unavailable && styles.slotDisabled,
                          ]}>
                          <Paragraph
                            size={13}
                            weight={'700'}
                            style={{
                              color: active
                                ? appColors.white
                                : unavailable
                                  ? '#c6c6d0'
                                  : appColors.charcoal,
                              textDecorationLine: unavailable
                                ? 'line-through'
                                : 'none',
                            }}>
                            {t}
                          </Paragraph>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>

                {error ? (
                  <Paragraph size={12} color={'red'}>
                    {error}
                  </Paragraph>
                ) : null}
              </Section>

            </ScrollView>
          )}

          {/* PAYMENT — sticky above the CTA so the user can't miss it. On
              a short offer form the picker used to end up scrolled below
              the fixed footer, leaving the CTA disabled ("Choose payment
              method") with no visible picker to click. */}
          {isAuth ? (
            <View style={styles.paymentBar}>
              {payment.paymentAccounts.length === 0 ? (
                <View style={styles.paymentBarRow}>
                  <ActivityIndicator size={'small'} color={PINK} />
                  <Paragraph size={12} color={'gray'}>
                    Loading payment methods…
                  </Paragraph>
                </View>
              ) : payment.paymentAccounts.length > 1 ? (
                <View style={styles.paymentChipsRow}>
                  <Paragraph
                    size={11}
                    weight={'700'}
                    color={'gray'}
                    style={{textTransform: 'uppercase', letterSpacing: 1}}>
                    Pay with:
                  </Paragraph>
                  {payment.paymentAccounts.map(a => {
                    const active = a.identifier === payment.paymentAccount;
                    return (
                      <TouchableOpacity
                        key={a.identifier}
                        onPress={() =>
                          payment.selectPaymentAccount(a.identifier)
                        }
                        activeOpacity={0.85}
                        style={[
                          styles.paymentChip,
                          active && {
                            borderColor: accentColor,
                            backgroundColor: `${accentColor}12`,
                          },
                        ]}>
                        <Paragraph
                          size={12}
                          weight={active ? '700' : '400'}
                          style={{color: active ? accentColor : appColors.charcoal}}>
                          {a.localizeInfos?.title || a.identifier}
                        </Paragraph>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.paymentBarRow}>
                  <Paragraph
                    size={11}
                    weight={'700'}
                    color={'gray'}
                    style={{textTransform: 'uppercase', letterSpacing: 1}}>
                    Payment:
                  </Paragraph>
                  <Paragraph size={13} color={'charcoal'}>
                    {payment.paymentAccounts[0]?.localizeInfos?.title ||
                      payment.paymentAccounts[0]?.identifier ||
                      'Cash'}
                  </Paragraph>
                </View>
              )}
            </View>
          ) : null}

          {/* BOTTOM CTA */}
          <View style={[styles.bottom, {paddingBottom: insets.bottom + 12}]}>
            <TouchableOpacity
              onPress={onContinue}
              activeOpacity={0.9}
              // Unauthenticated → the button always fires (its only job is
              // to open sign-in). Authenticated → wait for a full selection.
              disabled={isLoading || (isAuth && !canContinue)}
              style={[
                styles.continue,
                (isLoading || (isAuth && !canContinue)) &&
                  styles.continueDisabled,
              ]}>
              {isLoading ? (
                <ActivityIndicator size={'small'} color={accentColor} />
              ) : (
                <>
                  <Paragraph
                    size={13}
                    weight={'700'}
                    style={{
                      color:
                        !isAuth || canContinue ? accentColor : MUTED,
                      letterSpacing: 1,
                    }}>
                    {ctaLabel}
                  </Paragraph>
                  <ChevronRight
                    size={16}
                    color={!isAuth || canContinue ? accentColor : MUTED}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>

          {booked ? <SuccessModal onClose={closeAll} /> : null}
        </View>
      </View>
    </Modal>
  );
};

// ── Section header + slot ──────────────────────────────────────────────────
const Section: React.FC<{title: string; children: React.ReactNode}> = ({
  title,
  children,
}) => (
  <View style={{gap: 10}}>
    <Paragraph
      size={11}
      weight={'700'}
      color={'gray'}
      style={{textTransform: 'uppercase', letterSpacing: 1.5}}>
      {title}
    </Paragraph>
    {children}
  </View>
);

// ── Salon dropdown (opens a bottom-sheet with the full salon list) ────────
const SalonRow: React.FC<{
  salons: BookingSalon[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  accentColor: string;
}> = ({salons, selectedId, onSelect, accentColor}) => {
  const selected = salons.find(s => s.id === selectedId);
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
        style={styles.salonRow}>
        <View
          style={[styles.salonIcon, {backgroundColor: `${accentColor}1a`}]}>
          <MapPin size={14} color={accentColor} />
        </View>
        <Paragraph
          size={14}
          weight={'700'}
          color={'charcoal'}
          style={{flex: 1}}
          numberOfLines={1}>
          {selected?.name ?? 'Select studio'}
        </Paragraph>
        <ChevronDown size={18} color={appColors.gray} />
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType={'fade'}
        onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Paragraph
              size={11}
              weight={'700'}
              color={'gray'}
              style={{
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 8,
              }}>
              Studio
            </Paragraph>
            <ScrollView style={{maxHeight: 360}}>
              {salons.map(s => {
                const active = s.id === selectedId;
                return (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => {
                      onSelect(s.id);
                      setOpen(false);
                    }}
                    activeOpacity={0.7}
                    style={[
                      styles.sheetItem,
                      active && {backgroundColor: `${accentColor}0f`},
                    ]}>
                    <View style={{flex: 1}}>
                      <Paragraph
                        size={15}
                        weight={active ? '700' : '600'}
                        style={{color: active ? accentColor : appColors.charcoal}}>
                        {s.name}
                      </Paragraph>
                      {s.address ? (
                        <Paragraph size={12} color={'gray'} style={{marginTop: 2}}>
                          {s.address}
                        </Paragraph>
                      ) : null}
                    </View>
                    {active ? (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: accentColor,
                        }}
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

// ── Master picker (compact row list) ───────────────────────────────────────
const MasterRowsPicker: React.FC<{
  masters: BookingMaster[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  currency: string;
  accentColor: string;
}> = ({masters, selectedId, onSelect, currency, accentColor}) => (
  <View style={{gap: 8}}>
    {masters.slice(0, 4).map(m => {
      const active = m.id === selectedId;
      return (
        <TouchableOpacity
          key={m.id}
          onPress={() => onSelect(m.id)}
          activeOpacity={0.85}
          style={[
            styles.masterRow,
            active && {
              borderColor: accentColor,
              shadowColor: accentColor,
              shadowOpacity: 0.18,
              shadowRadius: 10,
              shadowOffset: {width: 0, height: 4},
              elevation: 2,
            },
          ]}>
          <View
            style={[
              styles.avatar,
              {borderColor: `${accentColor}55`},
            ]}>
            {m.photo ? (
              <ExpoImage
                source={{uri: m.photo}}
                style={StyleSheet.absoluteFill}
                contentFit={'cover'}
                transition={200}
              />
            ) : null}
          </View>
          <View style={{flex: 1}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 6,
              }}>
              <Paragraph size={14} weight={'700'} color={'charcoal'}>
                {m.name}
              </Paragraph>
              {m.grade ? (
                <View
                  style={[styles.gradeBadge, {backgroundColor: accentColor}]}>
                  <Paragraph size={10} weight={'700'} color={'white'}>
                    {m.grade}
                  </Paragraph>
                </View>
              ) : null}
            </View>
            {m.specialties.length > 0 ? (
              <Paragraph size={12} color={'gray'} numberOfLines={1}>
                {m.specialties.join(', ')}
              </Paragraph>
            ) : null}
          </View>
          <View style={{alignItems: 'flex-end', gap: 2}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}>
              <Star size={12} color={appColors.blue} fill={appColors.blue} />
              <Paragraph size={12} weight={'700'} color={'charcoal'}>
                {m.rating.toFixed(1)}
              </Paragraph>
            </View>
            {m.price !== null ? (
              <Paragraph size={11} color={'gray'}>
                from {currency} {m.price}
              </Paragraph>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,0,14,0.35)',
    justifyContent: 'flex-end',
  },
  card: {
    height: '92%',
    backgroundColor: appColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  tabBtnActive: {
    backgroundColor: appColors.white,
    borderColor: appColors.white,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
  },
  salonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    // Background applied inline with `${accentColor}1a`.
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: appColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 16,
    maxHeight: '80%',
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  masterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: appColors.slate150,
    borderWidth: 2,
    // Colored border applied inline (accentColor-tint) so the ring matches
    // the offer card. Default here is a neutral fallback.
    borderColor: 'rgba(0,0,0,0.08)',
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    // Colored inline with accentColor.
  },
  dateTabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dateTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slot: {
    width: '23%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  slotDisabled: {
    opacity: 0.55,
  },
  bottom: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: appColors.slate150,
    backgroundColor: appColors.white,
  },
  paymentBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: appColors.slate150,
    backgroundColor: appColors.white,
  },
  paymentBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  paymentChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
  },
  continue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f7f7fb',
  },
  continueDisabled: {
    opacity: 0.65,
  },
});

export default OfferBookingScreen;
