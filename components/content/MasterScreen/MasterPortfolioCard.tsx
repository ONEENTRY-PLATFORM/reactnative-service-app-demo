import React, {useMemo, useState} from 'react';
import CardBase from '@/components/shared/CardBase';
import CustomImage from '@/components/shared/CustomImage';
import {Paragraph} from '@/components/shared/Paragraph';
import Rating from '@/components/shared/Rating';
import {Alert, View} from 'react-native';
import CustomButton from '@/components/shared/CustomButton';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {Link, router, useLocalSearchParams} from 'expo-router';
import Reviews from '@/assets/icons/Reviews.svg';
import {
  selectMasterForOrder,
  selectSalonForOrder,
} from '@/state/reducers/OrderSlice';
import {setBookingPrefill} from '@/state/reducers/BookingPrefillSlice';
import {IAdminEntity} from 'oneentry/dist/admins/adminsInterfaces';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';
import SalonSelectionModal from './SalonSelectionModal';

type Props = {
  master?: IAdminEntity;
  id?: number;
  role?: string;
};

const MasterPortfolioCard: React.FC<Props> = ({master, role, id}) => {
  const params = useLocalSearchParams();
  const {
    book_online_text,
    master_text,
    master_experience_text,
    leave_review_text,
  } = useAppSelector(state => state.SystemContentReducer?.content);
  const dispatch = useAppDispatch();
  const selectedSalon = useAppSelector(state => state.OrderReducer.salon);
  const allSalons = useAppSelector(state => state.SalonsReducer.salons);
  const [showSalonModal, setShowSalonModal] = useState(false);

  const masterSalons = useMemo(() => {
    if (!master?.attributeValues?.master_salon?.value) {
      return [];
    }
    // OneEntry entity-link shape is `[{ title, value: { id, parentId, ... } }]`;
    // the linked page id lives in `entry.value.id`, not `entry.id`. Reading
    // the wrong field returned [undefined] and made every master look like it
    // had no salons.
    const masterSalonIds = (
      master.attributeValues.master_salon.value as any[]
    )
      .map(entry => entry?.value?.id ?? entry?.id)
      .filter((id): id is number => typeof id === 'number');

    return allSalons.filter(salon => masterSalonIds.includes(salon.id));
  }, [master, allSalons]);

  const onSelectMaster = () => {
    if (!id || !master) {
      return Alert.alert('not all fields are filled');
    }

    // Web-parity flow: seed the booking wizard with the master's admin id
    // (specialist-first flow) and route to /booking. When the master works
    // in multiple studios and none has been picked, show the salon chooser
    // first so the wizard can also start with the studio locked in.
    if (masterSalons.length === 0) {
      dispatch(setBookingPrefill({masterAdminId: master.id}));
      router.navigate('/(tabs)/booking');
      return;
    }
    if (!selectedSalon && masterSalons.length > 1) {
      return setShowSalonModal(true);
    }
    const salon = selectedSalon ?? masterSalons[0];
    dispatch(
      setBookingPrefill({
        masterAdminId: master.id,
        salonId: salon?.id ?? null,
      }),
    );
    router.navigate('/(tabs)/booking');
  };

  const handleSalonSelect = (salon: IPagesEntity) => {
    dispatch(
      setBookingPrefill({masterAdminId: master!.id, salonId: salon.id}),
    );
    dispatch(selectSalonForOrder(salon));
    dispatch(selectMasterForOrder(master!));
    router.navigate('/(tabs)/booking');
  };

  if (!master) {
    return <View className={'animate-pulse h-[158px] w-full bg-gray'} />;
  }

  return (
    <>
      <CardBase
        touchableOpacityProps={{disabled: true}}
        onPress={() => {}}
        className={'flex-row mt-5 gap-x-4'}
        style={{minHeight: 158}}>
        <View className={'w-[136px]'}>
          <CustomImage
            width={136}
            height={158}
            className={'rounded-lg'}
            style={{
              objectFit: 'cover',
              flex: 1,
              aspectRatio: 136 / 158,
            }}
            uri={master?.attributeValues?.master_image?.value[0]?.downloadLink}
          />
        </View>
        <View className={'justify-between'}>
          <View className={'gap-y-2'}>
            <Paragraph color={'dark'} size={18}>
              {master?.attributeValues?.master_name?.value}
            </Paragraph>
            {role && (
              <Paragraph color={'primary'} weight={'600'} size={12}>
                {role + ' ' + master_text}
              </Paragraph>
            )}
            <Paragraph color={'dark'} size={12}>
              {master_experience_text + ' '}
              <Paragraph color={'primary'} size={12}>
                {master?.attributeValues?.master_expirience?.value}
              </Paragraph>
            </Paragraph>
            <View className={'flex-row items-center flex-wrap gap-x-3 gap-y-1'}>
              <Rating
                color={'#0EDEFB'}
                shorten={false}
                rating={master?.attributeValues?.master_rating?.value}
              />
              <Link
                href={`/(tabs)/masters/reviews?master=${params.master}&role=${role ?? ''}`}>
                <View className={'flex-row items-center gap-2'}>
                  <Reviews />
                  <Paragraph color={'dark'} size={18} weight={'400'}>
                    1
                  </Paragraph>
                </View>
              </Link>
              <Link
                href={`/(tabs)/masters/reviews?master=${params.master}&role=${role ?? ''}&action=leave`}>
                <Paragraph
                  color={'primary'}
                  size={13}
                  weight={'700'}
                  style={{textDecorationLine: 'underline'}}>
                  {leave_review_text || 'Leave a review'}
                </Paragraph>
              </Link>
            </View>
          </View>
          <CustomButton
            onPress={onSelectMaster}
            type={'sm'}
            title={book_online_text || 'Book online'}
          />
        </View>
      </CardBase>

      <SalonSelectionModal
        visible={showSalonModal}
        onClose={() => setShowSalonModal(false)}
        onSelectSalon={handleSalonSelect}
        masterSalons={masterSalons}
      />
    </>
  );
};

export default MasterPortfolioCard;
