import React, {Dispatch, memo} from 'react';
import {StyleSheet, View} from 'react-native';
import CustomButton from '@/components/shared/CustomButton';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {
  deselectTimeForOrder,
  selectTimeForOrder,
} from '@/state/reducers/OrderSlice';

interface Props {}

const times = Array.from({length: 12}, (_, i) => i + 10);

const TimePicker: React.FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const selectedTime = useAppSelector(state => state.OrderReducer.time);

  return (
    <View style={styles.container}>
      {times.map((time, index) => (
        <CustomButton
          key={index}
          isInline={selectedTime !== time}
          disabled={
            selectedTime ? selectedTime !== time : !!Math.round(Math.random())
          }
          title={time + ':00'}
          onPress={() => {
            if (time !== selectedTime) {
              dispatch(selectTimeForOrder(time));
            } else {
              dispatch(deselectTimeForOrder());
            }
          }}
          type={'sm'}
          style={{width: 80}}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    columnGap: 3,
    rowGap: 10,
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  button: {
    width: 84,
    paddingHorizontal: 10,
  },
});
export default memo(TimePicker);
