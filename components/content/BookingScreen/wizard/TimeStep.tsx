import {View} from 'react-native';
import {useAppSelector} from '@/state/hooks';
import SectionTitle from '@/components/shared/SectionTitle';
import CustomButton from '@/components/shared/CustomButton';
import WeeklyCalendar from '@/components/content/BookingScreen/WeeklyCalendar/WeeklyCalendar';
import TimePicker from '@/components/content/BookingScreen/TimePicker/TimePicker';

// Wizard step 4. Existing WeeklyCalendar + TimePicker reused — they read/write
// the OrderReducer directly so no props to thread. The Next button is enabled
// only when both a date and a time are selected.
type Props = {
  onNext: () => void;
};

const TimeStep = ({onNext}: Props) => {
  const {date, time} = useAppSelector(state => state.OrderReducer);
  const {select_date_text, select_time_text, select_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );

  const disabled = !date || time === undefined;
  const label = !date
    ? select_date_text
    : time === undefined
      ? select_time_text
      : select_text;

  return (
    <View style={{flex: 1}}>
      <View style={{marginBottom: 12}}>
        <SectionTitle title={select_date_text} />
      </View>
      <WeeklyCalendar />
      <View style={{marginTop: 20}}>
        <TimePicker />
      </View>
      <View style={{marginTop: 24}}>
        <CustomButton title={label} disabled={disabled} onPress={onNext} />
      </View>
    </View>
  );
};

export default TimeStep;
