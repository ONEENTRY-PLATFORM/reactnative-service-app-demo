import React, {memo, useCallback, useMemo, useRef, useState} from 'react';
import {StyleSheet, View, TouchableOpacity, Animated} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import dayjs, {Dayjs} from 'dayjs';
import ChevronLeft from '@/assets/icons/ChevronLeft.svg';
import ChevronRight from '@/assets/icons/ChevronRight.svg';
import {appColors} from '@/lib/constants/Colors';
import {Paragraph} from '@/components/shared/Paragraph';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {
  deselectDateForOrder,
  selectDateForOrder,
} from '@/state/reducers/OrderSlice';
import useGetMasterSchedule from '@/components/content/BookingScreen/WeeklyCalendar/useGetMasterSchedule';
import WeekDayButton from '@/components/content/BookingScreen/WeeklyCalendar/WeekDayButton';

const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * The `WeeklyCalendar` component to select the date of service appointment with the master
 *
 * It allows users to:
 * - Navigate between weeks using swipe gestures or arrow buttons.
 * - Select available days within the week based on the master's schedule.
 * - Highlight the currently selected date and mark unavailable days.
 *
 * @returns {JSX.Element} A React Native component that renders the weekly calendar.
 *
 * @example
 * <WeeklyCalendar />
 */

const WeeklyCalendar = ({}) => {
  /**
   * State variables:
   * - `weekOffset`: Tracks the current week offset from the current week (0 = current week).
   * - `animating`: Indicates whether an animation is in progress to prevent overlapping animations.
   */
  const [weekOffset, setWeekOffset] = useState(0);
  const [animating, setAnimating] = useState(false);
  /**
   * Animated value for horizontal translation during swipe gestures.
   */
  const translateX = useRef(new Animated.Value(0)).current;
  /**
   * Redux hooks:
   * - `dispatch`: Used to dispatch actions to update the selected date in the global state.
   * - `selectedMaster`: Retrieves the currently selected master for order.
   * - `date`: Retrieves the currently selected date for order from the Redux store.
   */
  const dispatch = useAppDispatch();
  const {master: selectedMaster} = useAppSelector(state => state.OrderReducer);
  const date = useAppSelector(state => state.OrderReducer.date);

  /**
   * Selected date as a Day.js object for easier manipulation.
   */
  const selectedDate = dayjs(date);

  /**
   * Calculates the start of the displayed week based on the current week and the offset.
   */
  const currentDate = dayjs().set('minutes', 0).set('millisecond', 0);
  const startOfCurrentWeek = currentDate.startOf('week').add(1, 'day');
  const displayedWeek = startOfCurrentWeek.add(weekOffset * 7, 'day');

  /**
   * Conveniently generated dates for calculating available/unavailable days
   */
  const {available} = useGetMasterSchedule({
    masterAttributes: selectedMaster?.attributeValues,
    displayedWeek,
  });

  /**
   * Generates an array of Day.js objects representing the days of the displayed week.
   */
  const weekDays = useMemo(
    () =>
      Array.from({length: 7}).map((_, index) =>
        displayedWeek.clone().add(index, 'day'),
      ),
    [displayedWeek],
  );

  /**
   * Handles date selection:
   * - If the clicked date matches the currently selected date, it deselects the date.
   * - Otherwise, it selects the clicked date and adds it to order.
   *
   * @param {Dayjs} preDate - The clicked date.
   */
  const onSelect = useCallback(
    (preDate: Dayjs) => {
      const candidate = preDate.valueOf();

      if (candidate === date) {
        dispatch(deselectDateForOrder());
      } else {
        dispatch(
          selectDateForOrder({
            date: candidate,
            times: available[preDate.toISOString()],
          }),
        );
      }
    },
    [date],
  );

  /**
   * Navigates between weeks:
   * - Prevents overlapping animations by checking the `animating` state.
   * - Prevents navigation before the current week.
   * - Animates the transition and updates the `weekOffset`.
   *
   * @param {'next' | 'prev'} direction - Direction of navigation ('next' or 'prev').
   */
  const navigateWeek = (direction: 'next' | 'prev') => {
    if (animating) return; // Prevent overlapping animations
    if (direction === 'prev' && weekOffset === 0) return; // Prevent going before current week
    setAnimating(true);

    // Swipe distance based on direction
    const toValue = direction === 'next' ? -300 : 300;

    Animated.timing(translateX, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Update the week offset after animation
      setWeekOffset(prev => (direction === 'next' ? prev + 1 : prev - 1));

      // Reset translateX for the next swipe
      translateX.setValue(0);
      setAnimating(false);
    });
  };

  /**
   * triggers the function to change the week and starts the animation
   *
   * @param {{nativeEvent: any}} event - Gesture event data.
   */
  const handleGesture = ({nativeEvent}: {nativeEvent: any}) => {
    const {translationX} = nativeEvent;

    if (animating) return;

    if (translationX > 50 && weekOffset > 0) {
      navigateWeek('prev'); // Swipe right
    } else if (translationX < -50) {
      navigateWeek('next'); // Swipe left
    } else {
      // Snap back to the original position for small swipes
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={Animated.event(
        [{nativeEvent: {translationX: translateX}}],
        {useNativeDriver: false},
      )}
      onEnded={handleGesture}>
      <View className={'pt-5 rounded-xs overflow-hidden'}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigateWeek('prev')}
            disabled={weekOffset === 0}>
            <ChevronLeft
              fill={weekOffset === 0 ? appColors.gray : appColors.primary}
            />
          </TouchableOpacity>
          <Paragraph color={'primary'} size={20} weight={'600'}>
            {displayedWeek.format('MMMM')}
          </Paragraph>
          <TouchableOpacity onPress={() => navigateWeek('next')}>
            <ChevronRight fill={appColors.primary} />
          </TouchableOpacity>
        </View>

        {/* Animated Calendar View */}
        <Animated.View
          className={'overflow-hidden'}
          style={[
            {transform: [{translateX}]}, // Smooth swipe effect
          ]}>
          {/* Weekdays */}
          <View className={'flex-row justify-between mb-1.5'}>
            {WEEK_DAYS.map((day, index) => (
              <Paragraph
                className={'flex-1 text-center'}
                color={'gray'}
                size={16}
                key={'weekday-' + index}>
                {day}
              </Paragraph>
            ))}
          </View>

          {/* Dates */}
          <View className={'flex-row justify-between'}>
            {weekDays.map((date, index) => (
              <WeekDayButton
                action={() => onSelect(date)}
                currentDate={date}
                selectedDate={selectedDate}
                available={available}
                key={'d' + index}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff00ff',
  },
  arrow: {
    fontSize: 18,
    color: '#ff00ff',
  },
  disabledArrow: {
    color: '#ccc',
  },
  weekContainer: {
    overflow: 'hidden',
  },
  selectedDateContainer: {
    backgroundColor: '#ff00ff',
  },
  dateText: {
    fontSize: 16,
    color: '#2d4150',
  },
});

export default WeeklyCalendar;
