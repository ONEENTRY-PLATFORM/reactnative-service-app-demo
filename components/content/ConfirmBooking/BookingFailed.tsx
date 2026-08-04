import React from 'react';
import CardBase from '@/components/shared/CardBase';
import {appColors} from '@/lib/constants/Colors';
import {Paragraph} from '@/components/shared/Paragraph';
import {useAppSelector} from '@/state/hooks';
import {router, useLocalSearchParams} from 'expo-router';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';

type Props = {};

const BookingFailed: React.FC<Props> = ({}) => {
  const {try_again_text, smth_wrong_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const params = useLocalSearchParams();

  return (
    <CardBase
      outline
      outlineColor={appColors.primary}
      onPress={() => {}}
      touchableOpacityProps={{className: 'rounded-lg'}}>
      <Paragraph
        className={'text-center'}
        weight={'300'}
        size={32}
        color={'dark'}>
        {smth_wrong_text || 'Something went wrong'}
      </Paragraph>
      <Paragraph
        className={'text-center'}
        weight={'300'}
        size={32}
        color={'blue'}>
        {params?.error || try_again_text || 'Please try again.'}
      </Paragraph>

      {/* CTA row — without these the failed-payment screen was a dead end.
          The order may still exist as an unpaid orphan; sending the user to
          visits_history lets them retry PAY from there. */}
      <View style={styles.ctaRow}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/visits_history')}
          activeOpacity={0.9}
          style={styles.cta}>
          <LinearGradient
            colors={['#f60efb', '#ed21f1']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
          />
          <Paragraph
            size={14}
            weight={'700'}
            color={'white'}
            style={{textTransform: 'uppercase', letterSpacing: 1}}>
            My appointments
          </Paragraph>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/home')}
          activeOpacity={0.85}
          style={styles.ctaOutline}>
          <Paragraph
            size={14}
            weight={'700'}
            color={'primary'}
            style={{textTransform: 'uppercase', letterSpacing: 1}}>
            Home
          </Paragraph>
        </TouchableOpacity>
      </View>
    </CardBase>
  );
};

const styles = StyleSheet.create({
  ctaRow: {marginTop: 24, marginHorizontal: 12, gap: 10},
  cta: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: appColors.white,
  },
  ctaOutline: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: appColors.primary,
    backgroundColor: appColors.white,
  },
});

export default BookingFailed;
