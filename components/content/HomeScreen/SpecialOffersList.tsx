import React, {memo} from 'react';
import {FlatList, Image, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import CardBase from '@/components/shared/CardBase';
import {IProductEntity} from 'oneentry/dist/products/productsInterfaces';
import {useGetBlockByMarkerQuery} from '@/api';

const images: Record<number, any> = {
  0: require('./assets/offer_bg1.png'),
  1: require('./assets/offer_bg2.png'),
  2: require('./assets/offer_bg3.png'),
  3: require('./assets/offer_bg4.png'),
};

const SpecialOfferCard = ({
  product,
  index,
}: {
  product: IProductEntity;
  index: number;
}) => {
  return (
    <CardBase onPress={() => {}}>
      <View
        className={
          'absolute w-full h-[100px] bg-dark z-10 items-center justify-center'
        }
        style={{
          borderTopLeftRadius: 200,
          borderTopRightRadius: 200,
          borderBottomLeftRadius: 1000,
          borderBottomRightRadius: 1000,
        }}>
        <Paragraph
          className={'w-2/3 text-center'}
          size={16}
          color={'white'}
          weight={'600'}>
          {product?.localizeInfos?.title?.toString()?.toUpperCase()}
        </Paragraph>
      </View>
      <Image
        className={'w-[136px] h-[158px] rounded-lg'}
        style={{objectFit: 'contain'}}
        source={images[index]}
      />
    </CardBase>
  );
};

type Props = {
  identifier: string;
};

const SpecialOffersList: React.FC<Props> = ({identifier}) => {
  const {
    data: block,
    isLoading,
    error,
  } = useGetBlockByMarkerQuery({marker: identifier, limit: 10});


  if (error) throw error;

  return (
    <View className={'gap-5'}>
      <Paragraph size={18} color={'dark'}>
        {block?.localizeInfos?.title?.toString()?.toUpperCase()}
      </Paragraph>
      <FlatList
        horizontal
        data={block?.similarProducts?.slice(0, 3)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{gap: 10}}
        renderItem={({item, index}) => (
          <SpecialOfferCard product={item} index={index} />
        )}
      />
    </View>
  );
};

export default memo(SpecialOffersList);
