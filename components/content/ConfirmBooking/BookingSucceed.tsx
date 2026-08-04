import React, {useCallback, useEffect} from 'react';
import CardBase from '@/components/shared/CardBase';
import {Paragraph} from '@/components/shared/Paragraph';
import {Link, router, useFocusEffect, useLocalSearchParams} from 'expo-router';
import CustomImage from '@/components/shared/CustomImage';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {appColors} from '@/lib/constants/Colors';
import Rating from '@/components/shared/Rating';
import Reviews from '@/assets/icons/Reviews.svg';
import {useAppSelector} from '@/state/hooks';
import {getMasterById} from '@/state/reducers/MastersSlice';
import {IOrdersFormData} from 'oneentry/dist/orders/ordersInterfaces';
import {useLazyGetOrderByIDQuery} from '@/api';
import dayjs from 'dayjs';

const BookingSucceed: React.FC = () => {
  const params = useLocalSearchParams();
  const [getOrder, {data, reset, isLoading}] = useLazyGetOrderByIDQuery();
  let masterId = Number(
    (data?.formData as IOrdersFormData[] | undefined)?.find(
      attr => attr.marker === 'master',
    )?.value?.[0],
  );
  const master = useAppSelector(state => getMasterById(state, masterId));

  useEffect(() => {
    // Reset previous data immediately when params.id changes
    reset();
    (async () => {
      getOrder({marker: 'orders', id: Number(params.id as string)});
    })();
  }, [params.id, getOrder, reset]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        reset();
      };
    }, [reset]),
  );

  // Don't render anything if data is still loading or no data/master available
  if (isLoading || !data || !master) {
    return null;
  }

  return (
    <CardBase onPress={() => {}}>
      <CardBase
        touchableOpacityProps={{disabled: true}}
        onPress={() => {}}
        className={'flex-row gap-x-4 mt-5'}>
        <CustomImage
          height={158}
          width={136}
          className={'rounded-lg'}
          style={{objectFit: 'cover'}}
          uri={master?.attributeValues?.master_image?.value[0]?.downloadLink}
        />
        <View className={'flex-1 justify-between'}>
          <View className={'gap-y-2'}>
            <Paragraph color={'dark'} size={18}>
              {master?.attributeValues?.master_name?.value}
            </Paragraph>
            <Paragraph color={'dark'} size={12}>
              <Paragraph color={'primary'} size={12}>
                {master?.attributeValues?.master_expirience?.value}
              </Paragraph>
            </Paragraph>
            <View className={'flex-row items-center gap-3'}>
              {master?.attributeValues?.master_rating?.value && (
                <Rating
                  color={'#0EDEFB'}
                  shorten={false}
                  rating={Number(master?.attributeValues?.master_rating?.value)}
                />
              )}
              <Link href={`/(tabs)/masters/reviews?master=${params.master}`}>
                <View className={'flex-row items-center gap-2'}>
                  <Reviews />
                  <Paragraph color={'dark'} size={18} weight={'400'}>
                    1
                  </Paragraph>
                </View>
              </Link>
            </View>

            <View className={'gap-y-2'}>
              <Paragraph size={16} color={'dark'}>
                {data?.products[0]?.title}
              </Paragraph>
              <Paragraph
                size={16}
                color={'dark'}
                style={{textDecorationLine: 'underline'}}>
                {dayjs(
                  data?.formData?.find(a => a.marker === 'interval')
                    ?.value[0][0],
                ).format('DD.MM.YYYY')}
              </Paragraph>
              <Paragraph size={16} color={'primary'} weight={'400'}>
                {dayjs(
                  data?.formData?.find(a => a.marker === 'interval')
                    ?.value[0][0],
                ).format('HH:mm')}
              </Paragraph>
            </View>
          </View>
        </View>
      </CardBase>

      <Paragraph
        className={'text-center mt-5'}
        weight={'300'}
        size={32}
        color={'blue'}>
        Your appointment has been confirmed.{'\n'} See you soon!
      </Paragraph>

      {/* CTA — without this the Stripe payment flow deposits the user on
          this static card with no obvious way to see the new booking.
          Routing to the appointments list closes the loop. */}
      <TouchableOpacity
        onPress={() => router.replace('/(tabs)/visits_history')}
        activeOpacity={0.9}
        style={styles.cta}>
        <LinearGradient
          colors={['#f60efb', '#ed21f1']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={StyleSheet.absoluteFill}
        />
        <Paragraph
          size={14}
          weight={'700'}
          color={'white'}
          style={{textTransform: 'uppercase', letterSpacing: 1}}>
          My appointments
        </Paragraph>
      </TouchableOpacity>
    </CardBase>
  );
};

const styles = StyleSheet.create({
  cta: {
    marginTop: 24,
    marginHorizontal: 12,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: appColors.white,
  },
});

export default BookingSucceed;
