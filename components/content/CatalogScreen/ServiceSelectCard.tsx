import React from 'react';
import CardBase from '@/components/shared/CardBase';
import {IProductEntity} from 'oneentry/dist/products/productsInterfaces';
import {View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import Price from '@/components/shared/Price';
import Select from '@/components/shared/Select';
import {appColors} from '@/constants/Colors';
import ServicesGroup from './ServicesGroup.svg';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {
  deselectServiceForOrder,
  selectServiceForOrder,
} from '@/state/reducers/OrderSlice';

type Props = {
  service: IProductEntity;
};

const ServiceSelectCard: React.FC<Props> = ({service}) => {
  const dispatch = useAppDispatch();
  const selectedService = useAppSelector(state => state.OrderReducer.service);

  const isSelected = selectedService?.id === service.id;

  const onSelect = () => {
    if (isSelected) {
      return dispatch(deselectServiceForOrder());
    }
    dispatch(selectServiceForOrder(service));
  };

  const type = service.attributeValues?.type?.value[0]?.title;
  const color = service.attributeValues?.offer_type?.value[0]?.extended?.value;
  const services = service.attributeValues?.services?.value;

  return (
    <CardBase onPress={onSelect}>
      <View className={'flex-row items-center px-4 justify-between w-full'}>
        {services ? (
          <View className={'flex-row items-center gap-x-2.5 w-1/2'}>
            <View
              style={{backgroundColor: color ?? appColors.primary}}
              className={'h-1.5 w-1.5 rounded-full bg-primary'}
            />
            <View>
              {services.map((service: Record<any, any>, index: number) => (
                <Paragraph key={index} size={16} color={'dark'}>
                  {service?.title}
                </Paragraph>
              ))}
            </View>
          </View>
        ) : (
          <View className={'flex-row items-center gap-x-2.5 w-1/2'}>
            <View
              style={{backgroundColor: color ?? appColors.primary}}
              className={'h-1.5 w-1.5 rounded-full bg-primary'}
            />
            <Paragraph size={16} color={'dark'}>
              {service.localizeInfos?.title}
            </Paragraph>
          </View>
        )}

        <View className={'flex-row items-center w-1/2 justify-between gap-x-2'}>
          {type && (
            <View
              style={{backgroundColor: color ?? appColors.primary}}
              className={
                'w-10 h-10 items-center justify-center text-center rounded-full'
              }>
              <Paragraph
                size={10}
                style={{textAlign: 'center'}}
                weight={'600'}
                color={'white'}>
                {type}
              </Paragraph>
            </View>
          )}
          {services?.length >= 2 && type && (
            <ServicesGroup
              fill={color}
              height={services?.length === 2 ? 34 : 50}
              width={services?.length === 2 ? 14 : 18}
            />
          )}

          <View className={'flex-1 items-end'}>
            <View className={'w-28 flex-row justify-between'}>
              <Price
                color={color ?? appColors.primary}
                size={'sm'}
                price={service?.attributeValues?.price?.value}
                sale={service?.attributeValues?.sale?.value}
                currency={service?.attributeValues?.currency?.value}
              />
              <Select selected={isSelected} color={color ?? appColors.primary} />
            </View>
          </View>
        </View>
      </View>
    </CardBase>
  );
};

export default ServiceSelectCard;
