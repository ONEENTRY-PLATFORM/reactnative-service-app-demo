import React, {useRef, useState} from 'react';
import {StyleSheet, View, TouchableOpacity, Animated} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import dayjs, {Dayjs} from 'dayjs';
import ChevronLeft from '@/assets/icons/ChevronLeft.svg';
import ChevronRight from '@/assets/icons/ChevronRight.svg';
import {appColors} from '@/constants/Colors';
import {Paragraph} from '@/components/shared/Paragraph';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {
  deselectDateForOrder,
  selectDateForOrder,
} from '@/state/reducers/OrderSlice';

const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const WeeklyCalendar = React.forwardRef((_, ref) => {
  const [weekOffset, setWeekOffset] = useState(0); // Tracks weeks from current week
  const [animating, setAnimating] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const dispatch = useAppDispatch();
  const date = useAppSelector(state => state.OrderReducer.date);

  const selectedDate = dayjs(date);
  console.log(selectedDate);

  const currentDate = dayjs().set('minutes', 0).set('millisecond', 0);
  const startOfCurrentWeek = currentDate.startOf('week').add(1, 'day');
  const displayedWeek = startOfCurrentWeek.add(weekOffset * 7, 'day');

  const weekDays = Array.from({length: 7}).map((_, index) =>
    displayedWeek.add(index, 'day'),
  );

  const onSelect = (preDate: Dayjs) => {
    const candidate = preDate.valueOf();
    if (candidate === date) {
      dispatch(deselectDateForOrder());
    } else {
      dispatch(selectDateForOrder(candidate));
    }
  };

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

  React.useImperativeHandle(ref, () => ({
    swipeNext: () => navigateWeek('next'),
    swipePrev: () => navigateWeek('prev'),
  }));

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
              <TouchableOpacity
                key={index}
                className={`flex-1 items-center py-2.5 rounded-full`}
                onPress={() => onSelect(date)}>
                <View
                  className={`w-[25px] h-[25px] rounded-full ${date.isSame(selectedDate) && 'bg-primary'} items-center justify-center`}>
                  <Paragraph
                    className={'text-center'}
                    color={date.isSame(selectedDate) ? 'white' : 'dark'}
                    size={16}
                    key={'day-' + index}>
                    {date.date()}
                  </Paragraph>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </PanGestureHandler>
  );
});

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
