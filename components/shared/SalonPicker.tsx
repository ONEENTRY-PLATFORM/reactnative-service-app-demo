import React, {memo, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {Paragraph} from '@/components/shared/Paragraph';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {appColors} from '@/lib/constants/Colors';
import Arrow from '@/assets/icons/ChevronDownGray.svg';
import {selectSalonForOrder} from '@/state/reducers/OrderSlice';
import {attrEntries, attrText} from '@/lib/oneentry/attributes';

type Props = Record<string, never>;

const DropdownElement = ({
  title,
  value,
  id,
}: {
  title?: string;
  value?: string;
  selected?: boolean;
  id?: number;
}) => {
  const masters = useAppSelector(state => state.MastersReducer.masters);
  const service = useAppSelector(state => state.OrderReducer.service);

  const {isActive} = useMemo(() => {
    if (!service) {
      return {isActive: true};
    }

    let isMasters = masters.some(master => {
      const isService = attrEntries<Record<any, any>>(
        master?.attributeValues?.master_services,
      ).some((value: Record<any, any>) => {
        const qualified = service?.localizeInfos?.title === value?.title;
        if (qualified) {
          return qualified;
        }
      });

      if (isService) {
        return attrEntries<Record<any, any>>(
          master?.attributeValues?.master_salon,
        ).some((value: Record<any, any>) => {
          const qualified = value.id === id;
          return qualified;
        });
      }

      return isService;
    });

    return {isActive: isMasters};
  }, [masters, service, id]);

  return (
    <View className={'px-5 py-2.5'}>
      <Paragraph color={isActive ? 'dark' : 'gray'} size={16}>
        {title?.toUpperCase()}
      </Paragraph>
      <Paragraph size={13}>{value}</Paragraph>
    </View>
  );
};

const SalonPicker: React.FC<Props> = () => {
  const {salons} = useAppSelector(state => state.SalonsReducer);
  const selectedSalon = useAppSelector(state => state.OrderReducer.salon);
  const {select_salon_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const dispatch = useAppDispatch();

  const data = salons.map((salon, i) => {
    return {
      label: salon.localizeInfos.title,
      value: i.toString(),
    };
  });

  const selectedSalonIndex = selectedSalon
    ? salons.findIndex(salon => salon.id === selectedSalon.id)
    : -1;

  const onChange = (item: number) => {
    // @ts-ignore
    dispatch(selectSalonForOrder(salons[item?._index]));
  };

  return (
    <Dropdown
      placeholder={select_salon_text}
      // @ts-ignore
      data={data}
      value={selectedSalonIndex >= 0 ? selectedSalonIndex.toString() : ''}
      onChange={onChange}
      // @ts-ignore
      labelField="label"
      // @ts-ignore
      valueField="value"
      style={styles.dropdown}
      placeholderStyle={styles.placeholder}
      selectedTextStyle={styles.selectedTextStyle}
      maxHeight={300}
      renderRightIcon={() => <Arrow />}
      containerStyle={styles.container}
      itemContainerStyle={styles.container}
      // @ts-ignore
      renderItem={(item: {label: any; value: any}, selected) => {
        const index = parseInt(item.value);
        return (
          <DropdownElement
            title={item.label}
            value={
              attrText(salons[index]?.attributeValues?.salon_address) ||
              'no value'
            }
            id={salons[index]?.id}
          />
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  dropdown: {
    borderRadius: 1000,
    borderColor: appColors.gray,
    borderWidth: 1,
    paddingHorizontal: 20,
    height: 42,
  },
  container: {
    borderRadius: 20,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: appColors.dark,
    textTransform: 'capitalize',
  },
  placeholder: {
    color: appColors.gray,
  },
});
export default memo(SalonPicker);
