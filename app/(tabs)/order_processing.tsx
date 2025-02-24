import React from 'react';
import {Screen} from '@/components/shared/Screen';
import PaymentMethodsList from '@/components/content/OrderProccessing/PaymentMethodsList';
import ProcessingActions from '@/components/content/OrderProccessing/ProcessingActions';
import OrderReviewCard from '@/components/content/OrderProccessing/OrderReviewCard';

type Props = {};

const OrderProcessing: React.FC<Props> = ({}) => {
  return (
    <Screen isFull edges={['top', 'horizontal']}>
      <OrderReviewCard />
      <PaymentMethodsList />
      <ProcessingActions />
    </Screen>
  );
};

export default OrderProcessing;
