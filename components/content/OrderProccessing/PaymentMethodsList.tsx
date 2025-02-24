import React, {useMemo, useState} from 'react';
import {FlatList, TouchableOpacity, View} from 'react-native';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {useGetAccountsQuery} from '@/api';
import {IAccountsEntity} from 'oneentry/dist/payments/paymentsInterfaces';
import Select from '@/components/shared/Select';
import {selectPaymentMethodForOrder} from '@/state/reducers/OrderSlice';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/constants/Colors';
import Card from '@/assets/icons/Card.svg';

type MethodProps = {
  account: IAccountsEntity;
  index: number;
};

const PaymentMethod: React.FC<MethodProps> = ({account, index}) => {
  const dispatch = useAppDispatch();
  const selectedMethod = useAppSelector(state => state.OrderReducer.method);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        dispatch(selectPaymentMethodForOrder(account.identifier));
      }}
      className={
        'flex-row pt-2.5 pb-3.5 px-2.5 bg-transparent rounded-xs items-center justify-between border-b-sm border-gray'
      }>
      <View className={'flex-row items-center gap-3'}>
        <Card />
        <Paragraph size={16} color={'dark'}>{account?.localizeInfos?.title}</Paragraph>
      </View>
      <Select
        color={appColors.primary}
        selected={selectedMethod === account.identifier}
      />
    </TouchableOpacity>
  );
};

type Props = {};

const PaymentMethodsList: React.FC<Props> = ({}) => {
  const {data} = useGetAccountsQuery({});
  // const paymentMethods = useAppSelector(
  //   state => state.OrderReducer.paymentMethods,
  // );

  // Filter the payment methods to only include those in the whitelist
  const whitelistMethods = useMemo(() => {
    if (data) {
      return data.filter(method => {
        console.log(method);
        // const index = paymentMethods?.findIndex(
        //   whitelistMethod => method.identifier === whitelistMethod.identifier,
        // );
        // if (index !== -1) {
        //   return method;
        // }
      });
    }

    return [];
  }, [data]);

  return (
    <FlatList
      data={data}
      className={'mt-2.5'}
      contentContainerStyle={{gap: 10}}
      renderItem={({item, index}) => (
        <PaymentMethod index={index} account={item} />
      )}
    />
  );
};

export default PaymentMethodsList;
