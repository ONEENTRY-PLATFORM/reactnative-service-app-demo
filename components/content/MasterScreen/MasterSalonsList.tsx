import React from 'react';
import {FlatList, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import Location from '@/assets/icons/Location.svg';

type Props = {
  salons?: any[];
};

export const MasterSalon = ({title}: {title: string}) => {
  return (
    <View className={'flex-row items-center gap-x-2.5'}>
      <Location />
      <Paragraph color={'dark'}>{title}</Paragraph>
    </View>
  );
};

const MasterSalonsList: React.FC<Props> = ({salons}) => {
  return (
    <FlatList
      data={salons}
      renderItem={({item}) => <MasterSalon title={item?.title} />}
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
