import React from 'react';
import {Modal, StyleSheet, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Check} from 'lucide-react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {BRAND_GRADIENT, PINK} from '../constants';

interface Props {
  onClose: () => void;
}

// Ported from nextjs-beauty SuccessModal. Green check bubble, big title,
// close CTA. Rendered above the wizard once the order is created.
const SuccessModal: React.FC<Props> = ({onClose}) => (
  <Modal transparent visible animationType={'fade'} onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <LinearGradient
            colors={BRAND_GRADIENT as unknown as [string, string]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
          />
          <Check size={32} color={appColors.white} strokeWidth={3} />
        </View>
        <Paragraph
          size={22}
          weight={'700'}
          color={'charcoal'}
          style={{textAlign: 'center'}}>
          Appointment booked!
        </Paragraph>
        <Paragraph
          size={13}
          color={'gray'}
          style={{textAlign: 'center', lineHeight: 19}}>
          We sent the details to your inbox. You can find this booking in your
          profile.
        </Paragraph>
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.9}
          style={styles.cta}>
          <LinearGradient
            colors={BRAND_GRADIENT as unknown as [string, string]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
          />
          <Paragraph
            size={13}
            weight={'700'}
            color={'white'}
            style={{letterSpacing: 1, textTransform: 'uppercase'}}>
            Done
          </Paragraph>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,0,14,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    padding: 24,
    gap: 12,
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: appColors.white,
  },
  badge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: PINK,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 4,
  },
  cta: {
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 160,
    alignItems: 'center',
  },
});

export default SuccessModal;
