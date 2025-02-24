import {Screen} from '@/components/shared/Screen';
import OrdersByStatusPicker from '@/components/content/VisitsHistoryScreen/OrdersByStatusPicker';
import {useMemo, useState} from 'react';
import OrdersList from '@/components/content/VisitsHistoryScreen/OrdersList';

export default function VisitsScreen() {
  const [category, setCategory] = useState<number>(0);

  return (
    <Screen className={'gap-5'} edges={['top', 'horizontal']}>
      <OrdersByStatusPicker category={category} setCategory={setCategory} />
      <OrdersList category={category} />
    </Screen>
  );
}
