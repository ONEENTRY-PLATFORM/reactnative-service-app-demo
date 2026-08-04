import React from 'react';
import {View} from 'react-native';
import CardBase from '@/components/shared/CardBase';
import CustomImage from '@/components/shared/CustomImage';
import {Paragraph} from '@/components/shared/Paragraph';
import Rating from '@/components/shared/Rating';
import {appColors} from '@/lib/constants/Colors';
import CustomButton from '@/components/shared/CustomButton';
import {IOrderByMarkerEntity} from 'oneentry/dist/orders/ordersInterfaces';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {getSalonById} from '@/state/reducers/SalonsSlice';
import {getMasterById} from '@/state/reducers/MastersSlice';
import {router} from 'expo-router';
import {MasterSalon} from '@/components/content/MasterScreen/MasterSalonsList';
import Location from '@/assets/icons/Location.svg';
import CancelOrderButton from '@/components/content/VisitsHistoryScreen/CancelOrderButton';
import dayjs from 'dayjs';
import {
  selectMasterForOrder,
  selectSalonForOrder,
  selectServiceForOrder,
} from '@/state/reducers/OrderSlice';
import {useGetProductsByIdsQuery, useLazyGetProductsByIdsQuery} from '@/api';

type Props = {
  category: number;
  item: IOrderByMarkerEntity;
  refetch: () => void;
};

const UpcomingOrderCard: React.FC<Props> = ({category, item, refetch}) => {
  const dispatch = useAppDispatch();
  const {book_again_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const salonId = item.formData.find(item => item?.marker === 'order_salon')
    ?.value[0];
  const masterId = item.formData.find(item => item?.marker === 'master')
    ?.value[0];

  const orderDate = dayjs(
    item?.formData?.find(item => item?.marker === 'interval')?.value[0][0],
  );

  // Find salon and master in state by id from formData
  const salon = useAppSelector(state => getSalonById(state, salonId));
  const master = useAppSelector(state =>
    getMasterById(state, parseInt(masterId)),
  );
  const {data: service, isLoading} = useGetProductsByIdsQuery({
    ids: item?.products?.[0]?.id ? [item.products[0].id] : [],
  });

  const onBookAgain = () => {
    if (salon) {
      dispatch(selectSalonForOrder(salon));
    }
    if (master) {
      dispatch(selectMasterForOrder(master));
    }
    if (service?.length) {
      dispatch(selectServiceForOrder(service[0]));
    }

    router.navigate('/(tabs)/booking');
  };

  return (
    <View className={'gap-5'}>
      <CardBase
        className={'flex-row gap-x-5'}
        onPress={() => router.push(`/(tabs)/masters/${master?.id}`)}>
        {master?.attributeValues?.master_image?.value[0]?.downloadLink && (
          <CustomImage
            height={120}
            width={95}
            className={'rounded-md'}
            style={{objectFit: 'cover'}}
            uri={master?.attributeValues?.master_image?.value[0]?.downloadLink}
          />
        )}
        <View className={'flex-1 justify-between py-2'}>
          <View className={'gap-y-1'}>
            <Paragraph color={'dark'} size={18}>
              {master?.attributeValues?.master_name?.value}
            </Paragraph>
            <Rating color={'#0EDEFB'} shorten={false} rating={4.3} />
          </View>
        </View>
      </CardBase>
      <CardBase
        outline
        outlineColor={appColors.primary}
        className={'flex-row'}
        touchableOpacityProps={{className: 'rounded-md px-5'}}
        onPress={() => {}}>
        <View className={'flex-1'}>
          <View className={'py-2.5 gap-2'}>
            <Paragraph color={'dark'} size={16}>
              {salon?.localizeInfos?.title || 'undefined'}
            </Paragraph>
            <View className={'flex-row items-center gap-2'}>
              <Location />
              <Paragraph color={'dark'}>
                {salon?.attributeValues?.salon_address?.value || 'undefined'}
              </Paragraph>
            </View>
          </View>
          <View className={'w-full h-[1px] bg-primary'} />
          <View className={'py-2.5 gap-1'}>
            <Paragraph color={'dark'} size={16}>
              {item?.products[0]?.title}
            </Paragraph>
            <View className={'flex-row gap-x-2.5'}>
              <Paragraph className={'underline'} color={'dark'} size={16}>
                {orderDate.format('DD.MM.YYYY')}
              </Paragraph>
              <Paragraph color={'primary'} size={16}>
                {orderDate.format('HH:mm')}
              </Paragraph>
            </View>
          </View>
        </View>
        <View className={'ml-5 my-2.5 gap-2 items-center justify-center'}>
          {category === 0 ? (
            <>
              <CancelOrderButton refetch={refetch} orderData={item} />
            </>
          ) : (
            <>
              <CustomButton
                isLoading={isLoading}
                onPress={onBookAgain}
                type={'sm'}
                isInline
                title={book_again_text}
              />
            </>
          )}
        </View>
      </CardBase>
    </View>
  );
};

export default UpcomingOrderCard;
