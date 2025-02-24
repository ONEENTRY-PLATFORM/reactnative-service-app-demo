import {Screen} from '@/components/shared/Screen';
import SalonPicker from '@/components/shared/SalonPicker';
import WeeklyCalendar from '@/components/shared/WeeklyCalendar';
import {useAppSelector} from '@/state/hooks';
import ServicePicker from '@/components/content/BookingScreen/ServicePicker';
import MasterPicker from '@/components/content/BookingScreen/MasterPicker';
import OrderInfoCard from '@/components/content/BookingScreen/OrderInfoCard';
import TimePicker from '@/components/content/BookingScreen/TimePicker';
import {View} from 'react-native';
import ConfirmOrderButton from '@/components/content/BookingScreen/ConfirmOrderButton';

export default function BookingScreen() {
  const {master, service, salon} = useAppSelector(state => state.OrderReducer);
  const isSelected = master && service && salon;

  return (
    <Screen isFull className={'mt-5'} edges={['horizontal']}>
      {!isSelected && <SalonPicker />}
      <WeeklyCalendar />
      {isSelected && (
        <>
          <View className={'my-[30px]'}>
            <OrderInfoCard />
          </View>
          <TimePicker />
        </>
      )}
      {!service && <ServicePicker />}
      {service && !master && <MasterPicker />}
      {isSelected && <ConfirmOrderButton />}
    </Screen>
  );
}
