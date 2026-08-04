import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Calendar, Clock, MapPin, User} from 'lucide-react-native';
import type {IAccountsEntity} from 'oneentry/dist/payments/paymentsInterfaces';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {BRAND_GRADIENT, MONTHS, PINK} from '../constants';
import type {
  BookingFlow,
  BookingMaster,
  BookingSalon,
  BookingService,
} from '../types';
import {totalServiceMinutes} from '../slotUtils';
import PaymentMethodPicker from './PaymentMethodPicker';

interface Props {
  flow: BookingFlow | null;
  salon: BookingSalon | undefined;
  services: BookingService[];
  master: BookingMaster | undefined;
  masterAny: boolean;
  date: string;
  time: string;
  paymentAccounts: IAccountsEntity[];
  paymentAccount: string;
  onSelectPaymentAccount: (identifier: string) => void;
  onBook: () => void;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string;
  // Reschedule of an already-paid appointment: skip the payment picker and
  // relabel the CTA — the previous payment covers this move (salon handles
  // the paperwork).
  isPrepaidReschedule?: boolean;
}

const formatDate = (key: string): string => {
  if (!key) return '';
  const [y = 0, m = 0, d = 1] = key.split('-').map(Number);
  return `${d} ${MONTHS[m]} ${y}`;
};

const BookingSummary: React.FC<Props> = ({
  salon,
  services,
  master,
  masterAny,
  date,
  time,
  paymentAccounts,
  paymentAccount,
  onSelectPaymentAccount,
  onBook,
  isLoggedIn,
  isLoading,
  error,
  isPrepaidReschedule = false,
}) => {
  const total = services.reduce((sum, s) => sum + (s.price ?? 0), 0);
  const currency = services[0]?.currency || '';
  const duration = totalServiceMinutes(services);

  // Gate the CTA so we don't create an order with empty
  // paymentAccountIdentifier. Split into three cases so the label matches
  // the actual reason the button is disabled.
  const accountsLoading =
    isLoggedIn && !isPrepaidReschedule && paymentAccounts.length === 0;
  const needsPaymentPick =
    isLoggedIn &&
    !isPrepaidReschedule &&
    paymentAccounts.length > 0 &&
    !paymentAccount;
  const ctaLabel = !isLoggedIn
    ? 'Sign in to book'
    : isLoading
      ? isPrepaidReschedule
        ? 'Saving…'
        : 'Booking…'
      : accountsLoading
        ? 'Loading payment methods…'
        : needsPaymentPick
          ? 'Choose payment method'
          : isPrepaidReschedule
            ? 'Confirm reschedule'
            : 'Book Appointment';
  const ctaDisabled = isLoading || accountsLoading || needsPaymentPick;

  return (
    <View style={{gap: 14}}>
      <Paragraph size={18} weight={'400'} color={'charcoal'}>
        Your appointment
      </Paragraph>

      <View style={styles.card}>
        <Row Icon={MapPin} title={'Studio'} value={salon?.name ?? '—'} sub={salon?.address} />
        <Divider />
        <Row
          Icon={User}
          title={'Specialist'}
          value={masterAny ? 'Any specialist' : (master?.name ?? '—')}
          sub={master?.grade}
        />
        <Divider />
        <Row
          Icon={Calendar}
          title={'Services'}
          value={
            services.length > 0
              ? services.map(s => s.name).join(', ')
              : '—'
          }
          sub={duration ? `${duration} min` : undefined}
        />
        <Divider />
        <Row
          Icon={Clock}
          title={'When'}
          value={date && time ? `${formatDate(date)} · ${time}` : '—'}
        />
      </View>

      {isPrepaidReschedule ? (
        <View style={styles.prepaidNote}>
          <Paragraph size={13} weight={'700'} color={'charcoal'}>
            Already paid
          </Paragraph>
          <Paragraph size={12} color={'gray'} style={{lineHeight: 18}}>
            This appointment was paid earlier. No additional payment is
            required — the salon will apply your previous payment to the
            new time.
          </Paragraph>
        </View>
      ) : paymentAccounts.length === 0 ? (
        // API not resolved yet — without this label the user sees "Choose
        // payment method" disabled and nothing to click on.
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <ActivityIndicator size={'small'} color={PINK} />
          <Paragraph size={13} color={'gray'}>
            Loading payment methods…
          </Paragraph>
        </View>
      ) : paymentAccounts.length === 1 ? (
        // Auto-selected — surface which single option was used.
        <Paragraph size={13} color={'gray'}>
          Payment: {paymentAccounts[0]?.localizeInfos?.title ||
            paymentAccounts[0]?.identifier}
        </Paragraph>
      ) : (
        <PaymentMethodPicker
          accounts={paymentAccounts}
          selected={paymentAccount}
          onSelect={onSelectPaymentAccount}
        />
      )}

      {total > 0 ? (
        <View style={styles.total}>
          <Paragraph size={13} color={'gray'}>
            Total
          </Paragraph>
          <View style={{flexDirection: 'row', alignItems: 'baseline', gap: 6}}>
            <Paragraph size={22} weight={'700'} color={'charcoal'}>
              {total}
            </Paragraph>
            {currency ? (
              <Paragraph size={12} color={'gray'}>
                {currency}
              </Paragraph>
            ) : null}
          </View>
        </View>
      ) : null}

      {error ? (
        <View style={styles.error}>
          <Paragraph size={12} weight={'700'} style={{color: appColors.red}}>
            {error}
          </Paragraph>
        </View>
      ) : null}

      <TouchableOpacity
        onPress={onBook}
        activeOpacity={0.9}
        disabled={ctaDisabled}
        style={[styles.cta, ctaDisabled && styles.ctaDisabled]}>
        <LinearGradient
          colors={BRAND_GRADIENT as unknown as [string, string]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={StyleSheet.absoluteFill}
        />
        {isLoading ? (
          <ActivityIndicator size={'small'} color={appColors.white} />
        ) : (
          <Paragraph
            size={14}
            weight={'700'}
            color={'white'}
            style={{letterSpacing: 1, textTransform: 'uppercase'}}>
            {ctaLabel}
          </Paragraph>
        )}
      </TouchableOpacity>
    </View>
  );
};

const Row: React.FC<{
  Icon: typeof MapPin;
  title: string;
  value: string;
  sub?: string | undefined;
}> = ({Icon, title, value, sub}) => (
  <View style={{flexDirection: 'row', gap: 12, alignItems: 'flex-start'}}>
    <View style={styles.iconBubble}>
      <Icon size={14} color={PINK} />
    </View>
    <View style={{flex: 1}}>
      <Paragraph
        size={11}
        weight={'700'}
        color={'gray'}
        style={{textTransform: 'uppercase', letterSpacing: 1}}>
        {title}
      </Paragraph>
      <Paragraph size={14} weight={'700'} color={'charcoal'}>
        {value}
      </Paragraph>
      {sub ? (
        <Paragraph size={12} color={'gray'} style={{marginTop: 1}}>
          {sub}
        </Paragraph>
      ) : null}
    </View>
  </View>
);

const Divider = () => <View style={{height: 1, backgroundColor: appColors.slate150}} />;

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
    gap: 12,
  },
  iconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(237,33,241,0.1)',
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  prepaidNote: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#25D4A0',
    backgroundColor: '#25D4A014',
    gap: 4,
  },
  cta: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: PINK,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  error: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(243,61,56,0.08)',
    borderWidth: 1,
    borderColor: appColors.red,
  },
});

export default BookingSummary;
