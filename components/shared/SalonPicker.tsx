import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {Paragraph} from '@/components/shared/Paragraph';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {appColors} from '@/constants/Colors';
import {selectSalon} from '@/state/reducers/SalonsSlice';
import Arrow from '@/assets/icons/ChevronDownGray.svg';

type Props = {};

const DropdownElement = ({
  title,
  value,
}: {
  title?: string;
  value?: string;
  selected?: boolean;
}) => {
  return (
    <View className={'px-5 py-2.5'}>
      <Paragraph color={'dark'} size={16}>
        {title?.toUpperCase()}
      </Paragraph>
      <Paragraph size={13}>{value}</Paragraph>
    </View>
  );
};

const SalonPicker: React.FC<Props> = ({}) => {
  const {salons, selectedSalonIndex} = useAppSelector(
    state => state.SalonsReducer,
  );
  const dispatch = useAppDispatch();

  const data = salons.map((salon, i) => {
    return {
      label: salon.localizeInfos.title,
      value: i.toString(),
    };
  });

  const onChange = (item: number) => {
    console.log(item);
    // @ts-ignore
    dispatch(selectSalon(item?._index));
  };

  return (
    <Dropdown
      placeholder={'Salon choosing'}
      // @ts-ignore
      data={data}
      value={selectedSalonIndex?.toString() || ''}
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
            value={salons[index]?.attributeValues?.salon_address?.value || 'dd'}
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
