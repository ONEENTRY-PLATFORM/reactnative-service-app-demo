import React, {memo} from 'react';
import dayjs, {Dayjs} from 'dayjs';
import {TouchableOpacity, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';

type Props = {
  action: () => void;
  currentDate: Dayjs;
  selectedDate: Dayjs;
  available: Record<string, any>;
};

/**
 * The `WeekDayButton` component represents a single day in the WeeklyCalendar.
 *
 * It handles:
 * - Highlighting the currently selected date.
 * - Disabling past dates or dates that are not available based on the master's schedule.
 * - Marking exceptional dates as unavailable.
 *
 * @param {Props} props - The properties passed to the component.
 * @returns {JSX.Element} A React Native component that renders a day button.
 *
 * @example
 * <WeekDayButton
 *   action={() => handleSelect(day)}
 *   currentDate={day}
 *   selectedDate={selectedDate}
 *   exceptions={['2023-10-15', '2023-10-20']}
 *   available={[1, 2, 3, 4, 5]}
 * />
 */

const WeekDayButton = memo(
  ({action, currentDate, selectedDate, available}: Props) => {
    /**
     * Checks if the current date is the same as the selected date.
     */
    const isSelected = currentDate.isSame(selectedDate);

    /**
     * Gets the current date for next comparison.
     */
    const now = dayjs();

    /**
     * Start of the day for the current date and the current moment to disable dates in the past.
     */
    const dayjsStartOfDay = currentDate.startOf('day');
    const nowStartOfDay = now.startOf('day');

    /**
     * Determines if the button should be disabled:
     * - If the current date is in the past.
     * - If the day of the week is not in the `available` array.
     * - If the date is listed in the `exceptions` array.
     */
    const disabled =
      nowStartOfDay.isAfter(dayjsStartOfDay) ||
      !Object.keys(available).includes(currentDate.toISOString())

    return (
      <TouchableOpacity
        className={`flex-1 items-center py-2.5 rounded-full`}
        disabled={disabled}
        onPress={action}>
        <View
          className={`w-[25px] h-[25px] rounded-full ${isSelected && 'bg-primary'} items-center justify-center`}>
          <Paragraph
            className={'text-center'}
            color={disabled ? 'gray' : isSelected ? 'white' : 'dark'}
            size={16}>
            {currentDate.date()}
          </Paragraph>
        </View>
      </TouchableOpacity>
    );
  },
);

export default WeekDayButton;
