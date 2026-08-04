import React, {useEffect, useRef} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {ChevronLeft, ChevronRight} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {useAppDispatch} from '@/state/hooks';
import {clearBookingPrefill} from '@/state/reducers/BookingPrefillSlice';
import {BRAND_GRADIENT, MUTED, PINK} from './constants';
import {useBookingData} from './useBookingData';
import {useBookingWizard} from './hooks/useBookingWizard';
import EntryScreen from './ui/EntryScreen';
import StepBar from './ui/StepBar';
import SalonStep from './ui/SalonStep';
import ServiceStep from './ui/ServiceStep';
import SpecialistStep from './ui/SpecialistStep';
import DateTimeStep from './ui/DateTimeStep';
import BookingSummary from './ui/BookingSummary';
import SuccessModal from './ui/SuccessModal';

// Mobile port of nextjs-beauty BookingWizard (components/layout/booking-page/
// index.tsx). Vertical scroll on RN: step content + Back/Continue at the
// bottom, and the summary is one more step reached after Date & Time.

interface BookingWizardProps {
  // Product ids to preselect — mirrors the web ?services= query. Empty by default.
  servicesPrefill?: number[];
  salonPrefill?: number | null;
  masterAdminPrefill?: number | null;
  // Version bumps every time BookingPrefillSlice is set; the wizard uses it
  // to re-fire preselect even when the ids happen to match a previous run.
  prefillVersion?: number;
  // Reschedule branch — mirrors web ?reschedule=orderId.
  rescheduleOrderId?: number | null;
  // True when the previous appointment had already been paid online. The
  // reschedule replays as "cash" so the user isn't asked to pay a second
  // time — the salon settles the refund/re-application manually.
  rescheduleIsPrepaid?: boolean;
}

const BookingWizard: React.FC<BookingWizardProps> = ({
  servicesPrefill = [],
  salonPrefill = null,
  masterAdminPrefill = null,
  prefillVersion = 0,
  rescheduleOrderId = null,
  rescheduleIsPrepaid = false,
}) => {
  const {data, loading, error: dataError} = useBookingData();

  if (loading || !data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size={'large'} color={PINK} />
        <Paragraph size={13} color={'gray'} style={{marginTop: 12}}>
          Loading booking…
        </Paragraph>
      </View>
    );
  }
  if (dataError) {
    return (
      <View style={styles.loading}>
        <Paragraph size={13} color={'red'} style={{textAlign: 'center'}}>
          {dataError}
        </Paragraph>
      </View>
    );
  }

  return (
    <WizardInner
      data={data}
      servicesPrefill={servicesPrefill}
      salonPrefill={salonPrefill}
      masterAdminPrefill={masterAdminPrefill}
      prefillVersion={prefillVersion}
      rescheduleOrderId={rescheduleOrderId}
      rescheduleIsPrepaid={rescheduleIsPrepaid}
    />
  );
};

// Split: hooks must not be called after an early return. useBookingWizard
// wants a real BookingData.
const WizardInner: React.FC<{
  data: import('./types').BookingData;
  servicesPrefill: number[];
  salonPrefill: number | null;
  masterAdminPrefill: number | null;
  prefillVersion: number;
  rescheduleOrderId: number | null;
  rescheduleIsPrepaid: boolean;
}> = ({
  data,
  servicesPrefill,
  salonPrefill,
  masterAdminPrefill,
  prefillVersion,
  rescheduleOrderId,
  rescheduleIsPrepaid,
}) => {
  const insets = useSafeAreaInsets();
  const w = useBookingWizard(data, {
    servicesPrefill,
    salonPrefill,
    masterAdminPrefill,
    prefillVersion,
    rescheduleOrderId,
    rescheduleIsPrepaid,
  });

  // Consume the prefill: once the wizard has locked onto a flow with the
  // handed-off ids, clear the slice so a later plain "Book Now" doesn't
  // silently reuse it. Fires exactly once per version bump.
  const consumedVersion = useRef(0);
  const reduxDispatch = useAppDispatch();
  useEffect(() => {
    if (prefillVersion > consumedVersion.current && w.flow) {
      consumedVersion.current = prefillVersion;
      reduxDispatch(clearBookingPrefill());
    }
  }, [prefillVersion, w.flow, reduxDispatch]);

  const renderStep = () => {
    if (!w.flow) return <EntryScreen onChoose={w.startFlow} />;
    switch (w.currentStepKey) {
      case 'salon':
        return (
          <SalonStep
            salons={w.filteredSalons}
            selected={w.salon}
            onSelect={w.selectSalon}
          />
        );
      case 'service':
        return (
          <ServiceStep
            services={w.filteredServices}
            selectedIds={w.selectedServiceIds}
            onToggle={w.selectService}
          />
        );
      case 'specialist':
        return (
          <SpecialistStep
            masters={w.filteredMasters}
            selected={w.master}
            onSelect={w.selectMaster}
            allowAny
            services={w.serviceObjs}
            onClearService={w.clearService}
            categories={w.categories}
            categoryFilter={w.categoryFilter}
            onCategoryChange={w.onCategoryChange}
            salons={w.salons}
            selectedSalon={w.salonObj}
          />
        );
      case 'datetime':
        return (
          <DateTimeStep
            selectedDate={w.date}
            selectedTime={w.time}
            onDate={w.onDate}
            onTime={w.onTime}
            slots={w.slots}
            hasSchedule={w.hasSchedule}
            durationMinutes={w.durationMinutes}
            closeMinutes={w.closeMinutes}
          />
        );
      default:
        return null;
    }
  };

  const showSummary = w.mobileSummary && w.isLastStep;
  const primaryDisabled = showSummary
    ? !w.time
    : !w.canNext;
  const primaryLabel = showSummary ? 'Book' : w.isLastStep ? 'Review' : 'Continue';
  const onPrimary = () => {
    if (showSummary) return; // Book button lives in the summary card
    if (w.isLastStep) w.setMobileSummary(true);
    else w.handleNext();
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        // Bottom bar (Back/Continue) is sticky ~100px high + tab bar 54 +
        // safe area — content padding must clear it so the Book button at
        // the end of the summary card isn't hidden underneath.
        contentContainerStyle={{
          padding: 16,
          gap: 18,
          paddingBottom: insets.bottom + 170,
        }}>
        {w.flow ? (
          <StepBar
            steps={w.stepKeys}
            currentIdx={w.stepIdx}
            onGo={w.goStep}
          />
        ) : null}

        {showSummary ? (
          <BookingSummary
            flow={w.flow}
            salon={w.salonObj}
            services={w.serviceObjs}
            master={w.masterObj}
            masterAny={w.masterAny}
            date={w.date}
            time={w.time}
            paymentAccounts={w.paymentAccounts}
            paymentAccount={w.paymentAccount}
            onSelectPaymentAccount={w.selectPaymentAccount}
            onBook={w.handleConfirm}
            isLoggedIn={w.isAuth}
            isLoading={w.isLoading}
            error={w.error}
            isPrepaidReschedule={rescheduleIsPrepaid}
          />
        ) : (
          renderStep()
        )}
      </ScrollView>

      {w.flow ? (
        <View
          style={[
            styles.bottomBar,
            // The tab bar overlays the screen — push our fixed footer above
            // it. `insets.bottom` covers the safe area, plus the tab bar's
            // own content height (icons + labels + top padding = ~54).
            {paddingBottom: insets.bottom + 8, marginBottom: 54},
          ]}>
          <TouchableOpacity
            onPress={
              showSummary ? () => w.setMobileSummary(false) : w.handleBack
            }
            activeOpacity={0.85}
            style={styles.backBtn}>
            <ChevronLeft size={16} color={MUTED} />
            <Paragraph
              size={12}
              weight={'700'}
              style={{
                color: MUTED,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
              {w.stepIdx === 0 && !showSummary ? 'Change start' : 'Back'}
            </Paragraph>
          </TouchableOpacity>

          {!showSummary ? (
            <TouchableOpacity
              onPress={onPrimary}
              activeOpacity={0.9}
              disabled={primaryDisabled}
              style={[
                styles.nextBtn,
                primaryDisabled && styles.nextBtnDisabled,
              ]}>
              {!primaryDisabled ? (
                <LinearGradient
                  colors={BRAND_GRADIENT as unknown as [string, string]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              <Paragraph
                size={13}
                weight={'700'}
                style={{
                  color: primaryDisabled ? MUTED : appColors.white,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}>
                {primaryLabel}
              </Paragraph>
              <ChevronRight
                size={16}
                color={primaryDisabled ? MUTED : appColors.white}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {w.booked ? <SuccessModal onClose={w.handleCloseSuccess} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: appColors.slate150,
    backgroundColor: appColors.white,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f7f7fb',
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: PINK,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  nextBtnDisabled: {
    backgroundColor: '#f7f7fb',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default BookingWizard;
