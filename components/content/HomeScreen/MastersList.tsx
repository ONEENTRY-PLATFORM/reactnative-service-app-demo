import React from 'react';
import {Paragraph} from '@/components/shared/Paragraph';
import {FlatList, View} from 'react-native';
import {IAdminEntity} from 'oneentry/dist/admins/adminsInterfaces';
import CardBase from '@/components/shared/CardBase';
import CustomImage from '@/components/shared/CustomImage';
import {useAppSelector} from '@/state/hooks';
import {router} from 'expo-router';

const MasterCard = ({master}: {master: IAdminEntity}) => {
  return (
    <CardBase onPress={() => router.navigate(`/(tabs)/masters/${master.id}`)}>
      <CustomImage
        width={140}
        height={150}
        uri={master?.attributeValues?.master_image?.value[0]?.downloadLink}
        style={{objectFit: 'cover'}}
        className={'rounded-lg'}
      />
    </CardBase>
  );
};

type Props = {
  title: string;
};

const MastersList: React.FC<Props> = ({title}) => {
  const masters = useAppSelector(state => state.MastersReducer.masters);
  return (
    <View className={'gap-5'}>
      <Paragraph size={18} color={'dark'}>
        {title?.toUpperCase()}
      </Paragraph>
      <FlatList
        horizontal
        data={masters?.slice(0, 3)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{gap: 10}}
        renderItem={({item, index}) => (
          <MasterCard master={item} />
        )}
      />
    </View>
  );
};

export default MastersList;
