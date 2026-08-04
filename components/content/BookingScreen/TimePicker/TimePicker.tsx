import React, {memo, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import dayjs from 'dayjs';
import CustomButton from '@/components/shared/CustomButton';
import {
  deselectTimeForOrder,
  selectTimeForOrder,
} from '@/state/reducers/OrderSlice';

const allTimes = Array.from({length: 12}, (_, i) => i + 10);

/**
 * The `TimePicker` component allows users to select an available time for picked date to create an order.
 *
 * It is only rendered if a date has been selected. The component:
 * - Displays a list of available times based on the master's schedule.
 * - Allows users to select or deselect a time.
 * - Automatically deselects the time when the selected date changes.
 *
 * @returns {JSX.Element | null} A React Native component that renders the time picker or `null` if no date is selected.
 *
 * @example
 * <TimePicker />
 */
const TimePicker: React.FC = ({}): JSX.Element | null => {
  const dispatch = useAppDispatch();

  // Retrieve the selected date and time from the order state
  const {
    time: selectedTime,
    date: selectedDate,
    dateTimes,
  } = useAppSelector(state => state.OrderReducer);

  // Calculate the day of the week for the selected date
  const dayOfWeek = selectedDate ? dayjs(selectedDate).day() : null;

  // Fetch available times for the selected day of the week
  const availableTimes = useMemo(
    () =>
      dateTimes?.map((time: any) => {
        const hour = time[0]?.hours;
        return hour;
      }) || allTimes,
    [dateTimes],
  );

  useEffect(() => {
    dispatch(deselectTimeForOrder());
  }, [selectedDate]);

  if (!selectedDate) {
    return null;
  }

  return (
    <View
      className={
        'flex-row w-full gap-y-2.5 justify-around items-start flex-wrap'
      }>
      {allTimes.map((time, index) => (
        <CustomButton
          key={index}
          isInline={selectedTime !== time}
          disabled={
            selectedTime
              ? selectedTime !== time
              : !availableTimes.includes(time)
          }
          title={`${time}:00`}
          onPress={() => {
            if (time !== selectedTime) {
              dispatch(selectTimeForOrder(time));
            } else {
              dispatch(deselectTimeForOrder());
            }
          }}
          type={'sm'}
          style={{width: '23%'}}
        />
      ))}
    </View>
  );
};

export default memo(TimePicker);
