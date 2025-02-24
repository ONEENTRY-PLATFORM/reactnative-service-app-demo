import React, {useMemo} from 'react';
import {IOrderByMarkerEntity} from 'oneentry/dist/orders/ordersInterfaces';
import {useGetUserOrdersQuery} from '@/api';
import {FlatList} from 'react-native';
import UpcomingOrderCard from '@/components/content/VisitsHistoryScreen/UpcomingOrderCard';
import Footer from '@/components/shared/Footer';
import CustomButton from '@/components/shared/CustomButton';
import {useAppSelector} from '@/state/hooks';
import {router, useFocusEffect} from 'expo-router';
import {useAuth} from '@/state/contexts/AuthContext';
import {Paragraph} from '@/components/shared/Paragraph';

type Props = {
  category: number;
};

const OrdersList: React.FC<Props> = ({category}) => {
  const {user} = useAuth();
  const {data, isLoading, refetch} = useGetUserOrdersQuery({marker: 'orders'});
  const {first_order_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );

  const sorted = useMemo(() => {
    const sortedOrders: Record<any, IOrderByMarkerEntity[]> = {
      upcoming: [],
      completed: [],
      canceled: [],
    };

    if (!data) {
      return sortedOrders;
    }

    data?.items?.map(item => {
      switch (item.statusIdentifier) {
        case 'upcoming':
          sortedOrders.upcoming.push(item);
          break;
        case 'completed':
          sortedOrders.completed.push(item);
          break;
        case 'canceled':
          sortedOrders.canceled.push(item);
          break;
      }
    });

    return sortedOrders;
  }, [data]);

  useFocusEffect(() => {
    refetch();
  });

  const keys = Object.keys(sorted);

  if (!user) {
    return <Paragraph>Login or create account</Paragraph>;
  }

  if (isLoading) {
    return <></>;
  }

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{gap: 20}}
      ListFooterComponent={<Footer />}
      ListEmptyComponent={
        <CustomButton
          title={first_order_text}
          onPress={() => {
            router.navigate('/(tabs)/booking');
          }}
        />
      }
      data={sorted[keys[category]]}
      renderItem={({item}) => (
        <UpcomingOrderCard item={item} category={category} />
      )}
    />
  );
};

export default OrdersList;
