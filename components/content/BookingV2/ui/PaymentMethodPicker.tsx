import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import type {IAccountsEntity} from 'oneentry/dist/payments/paymentsInterfaces';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {PINK} from '../constants';

interface Props {
  accounts: IAccountsEntity[];
  selected: string;
  onSelect: (identifier: string) => void;
}

// Simple radio-row picker; only shown when the salon has more than one
// account configured — matches web BookingSummary behaviour.
const PaymentMethodPicker: React.FC<Props> = ({accounts, selected, onSelect}) => {
  if (accounts.length <= 1) return null;
  return (
    <View style={{gap: 8}}>
      <Paragraph size={12} weight={'700'} color={'gray'} style={{textTransform: 'uppercase', letterSpacing: 1}}>
        Payment
      </Paragraph>
      {accounts.map(a => {
        const active = a.identifier === selected;
        return (
          <TouchableOpacity
            key={a.identifier}
            onPress={() => onSelect(a.identifier)}
            activeOpacity={0.85}
            style={[styles.row, active && styles.rowActive]}>
            <View style={[styles.radio, active && styles.radioActive]}>
              {active ? <View style={styles.radioDot} /> : null}
            </View>
            <Paragraph size={14} weight={active ? '700' : '400'} color={'charcoal'}>
              {a.localizeInfos?.title || a.identifier}
            </Paragraph>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
  },
  rowActive: {borderColor: PINK},
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: appColors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {borderColor: PINK},
  radioDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: PINK},
});

export default PaymentMethodPicker;
