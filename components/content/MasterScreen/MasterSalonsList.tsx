import React from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import Location from '@/assets/icons/Location.svg';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {selectSalonForOrder} from '@/state/reducers/OrderSlice';

type Props = {
  salons?: any[];
};

export const MasterSalon = ({
  title,
  onPress,
  isSelected,
}: {
  title: string;
  onPress?: () => void;
  isSelected?: boolean;
}) => {
  return (
    <Pressable
      className={`flex-row items-center px-2.5 py-2  gap-x-2.5 ${
        isSelected ? 'bg-primary/10 rounded-lg' : ''
      }`}
      onPress={onPress}>
      <Location />
      <Paragraph color={'dark'}>{title}</Paragraph>
    </Pressable>
  );
};

const MasterSalonsList: React.FC<Props> = ({salons}) => {
  const dispatch = useAppDispatch();
  const selectedSalon = useAppSelector(state => state.OrderReducer.salon);
  const existingSalons = useAppSelector(state => state.SalonsReducer.salons);

  const onPress = (salon: any) => {
    const selected = existingSalons.find(s => s.id === salon.id);
    if (selected) {
      dispatch(selectSalonForOrder(selected));
    }
  };

  return (
    <FlatList
      data={salons}
      renderItem={({item}) => (
        <MasterSalon
          onPress={() => onPress(item)}
          title={item?.title}
          isSelected={selectedSalon?.id === item?.id}
        />
      )}
      numColumns={3}
      keyExtractor={(_, index) => index.toString()}
      columnWrapperStyle={{
        gap: 15,
      }}
      contentContainerStyle={{gap: 24}}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
};

export default MasterSalonsList;
