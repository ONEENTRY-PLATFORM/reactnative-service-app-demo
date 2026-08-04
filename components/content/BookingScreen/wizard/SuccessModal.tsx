import {Modal, TouchableOpacity, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import CustomButton from '@/components/shared/CustomButton';
import GradientLine from '@/components/shared/GradientLine';
import {appColors} from '@/lib/constants/Colors';
import X from '@/assets/icons/x.svg';

// Success confirmation shown after Orders.createOrder resolves. Mirrors the
// SuccessModal in nextjs-beauty/booking-page: two-CTA layout — jump to visits
// history, or pay now (only when the order is not cash). Consumer wires the
// callbacks; the modal is dumb.
type Props = {
  visible: boolean;
  title?: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  onClose: () => void;
};

const SuccessModal = ({
  visible,
  title = 'Booking confirmed',
  description = 'Your appointment has been created.',
  primaryLabel = 'View in history',
  secondaryLabel,
  onPrimary,
  onSecondary,
  onClose,
}: Props) => (
  <Modal transparent visible={visible} animationType={'fade'} onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.close} onPress={onClose} activeOpacity={0.7}>
          <X width={16} height={16} />
        </TouchableOpacity>
        <Paragraph
          family={'league-gothic'}
          size={28}
          color={'charcoal'}
          style={{textTransform: 'uppercase', textAlign: 'center'}}>
          {title}
        </Paragraph>
        <GradientLine style={{width: 60, marginTop: 6, borderRadius: 2}} />
        <Paragraph
          size={14}
          color={'ink'}
          style={{textAlign: 'center', marginTop: 12}}>
          {description}
        </Paragraph>
        <View style={{gap: 10, marginTop: 20, width: '100%'}}>
          <CustomButton title={primaryLabel} onPress={onPrimary} />
          {secondaryLabel && onSecondary ? (
            <CustomButton
              title={secondaryLabel}
              isInline
              onPress={onSecondary}
            />
          ) : null}
        </View>
      </View>
    </View>
  </Modal>
);

const styles = {
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 20,
  },
  card: {
    width: '100%' as const,
    maxWidth: 380,
    backgroundColor: appColors.white,
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 8},
    elevation: 8,
  },
  close: {
    position: 'absolute' as const,
    top: 14,
    right: 14,
    padding: 6,
  },
};

export default SuccessModal;
