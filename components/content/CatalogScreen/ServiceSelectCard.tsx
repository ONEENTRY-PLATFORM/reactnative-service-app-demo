import React from 'react';
import CardBase from '@/components/shared/CardBase';
import {IProductsEntity} from 'oneentry/dist/products/productsInterfaces';
import {View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import Price from '@/components/shared/Price';
import Select from '@/components/shared/Select';
import {appColors} from '@/lib/constants/Colors';
import ServicesGroup from './ServicesGroup.svg';
import {attrEntries, attrNumber, attrText} from '@/lib/oneentry/attributes';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {
  deselectMasterForOrder,
  deselectServiceForOrder,
  deselectTimeForOrder,
  selectServiceForOrder,
} from '@/state/reducers/OrderSlice';

type Props = {
  service: IProductsEntity;
};

const ServiceSelectCard: React.FC<Props> = ({service}) => {
  const dispatch = useAppDispatch();
  const selectedService = useAppSelector(state => state.OrderReducer.service);
  const selectedMaster = useAppSelector(state => state.OrderReducer.master);

  const isSelected = selectedService?.id === service.id;

  const onSelect = () => {
    if (isSelected) {
      return dispatch(deselectServiceForOrder());
    }
    dispatch(selectServiceForOrder(service));

    // Only deselect master if they don't support this service
    if (selectedMaster) {
      const masterSupportsService = attrEntries<Record<any, any>>(
        selectedMaster?.attributeValues?.master_services,
      ).some((masterService: Record<any, any>) => {
        return service?.localizeInfos?.title === masterService?.title;
      });

      if (!masterSupportsService) {
        dispatch(deselectMasterForOrder());
      }
    }

    dispatch(deselectTimeForOrder());
  };

  const type = attrEntries<Record<any, any>>(service.attributeValues?.type)[0]
    ?.title;
  const color = attrEntries<Record<any, any>>(
    service.attributeValues?.offer_type,
  )[0]?.extended?.value;
  const services = attrEntries<Record<any, any>>(
    service.attributeValues?.services,
  );

  return (
    <CardBase onPress={onSelect}>
      <View className={'flex-row items-center px-4 justify-between w-full'}>
        {services.length > 0 ? (
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
                'w-11 h-11 items-center justify-center text-center rounded-full'
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
          {services.length >= 2 && type && (
            <ServicesGroup
              fill={color}
              height={services.length === 2 ? 34 : 50}
              width={services.length === 2 ? 14 : 18}
            />
          )}

          <View className={'flex-1 items-end'}>
            <View className={'w-28 flex-row justify-between'}>
              <Price
                color={color ?? appColors.primary}
                size={'sm'}
                price={attrNumber(service?.attributeValues?.price)}
                sale={attrNumber(service?.attributeValues?.sale)}
                currency={attrText(service?.attributeValues?.currency)}
              />
              <Select
                selected={isSelected}
                color={color ?? appColors.primary}
              />
            </View>
          </View>
        </View>
      </View>
    </CardBase>
  );
};

export default ServiceSelectCard;
