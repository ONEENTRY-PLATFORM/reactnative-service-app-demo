import React from 'react';
import CardBase from '@/components/shared/CardBase';
import {IAdminEntity} from 'oneentry/dist/admins/adminsInterfaces';
import {
  attrFileUrl,
  attrNumber,
  attrRichText,
  attrText,
} from '@/lib/oneentry/attributes';
import CustomImage from '@/components/shared/CustomImage';
import {View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import Rating from '@/components/shared/Rating';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import Select from '@/components/shared/Select';
import {appColors} from '@/lib/constants/Colors';
import {Link} from 'expo-router';
import {
  deselectSalonForOrder,
  deselectMasterForOrder,
  selectMasterForOrder,
  selectSalonForOrder,
  deselectTimeForOrder,
} from '@/state/reducers/OrderSlice';

type Props = {
  master: IAdminEntity;
  role: string;
};

const MasterInMastersCard: React.FC<Props> = ({master, role}) => {
  const {check_profile_text, master_text} = useAppSelector(
    state => state.SystemContentReducer?.content,
  );
  const selectedMaster = useAppSelector(state => state.OrderReducer.master);
  const selectedSalon = useAppSelector(state => state.OrderReducer.salon);
  const dispatch = useAppDispatch();

  const isSelected = master?.id === selectedMaster?.id;

  const onSelect = () => {
    dispatch(deselectTimeForOrder());
    if (isSelected) {
      return dispatch(deselectMasterForOrder());
    }
    if (selectedSalon) {
      dispatch(selectSalonForOrder(selectedSalon));
      dispatch(selectMasterForOrder(master));
    }
  };

  return (
    <CardBase
      outline
      outlineColor={isSelected ? appColors.primary : undefined}
      className={'flex-row gap-x-5'}
      onPress={onSelect}>
      <CustomImage
        height={158}
        width={136}
        className={'rounded-lg'}
        style={{objectFit: 'cover'}}
        uri={attrFileUrl(master?.attributeValues?.master_image)}
      />
      <View className={'flex-1 py-2 justify-between'}>
        <View className={'gap-2.5'}>
          <View className={'gap-0.5'}>
            <Paragraph className={'leading-[18px]'} color={'dark'} size={18}>
              {attrText(master?.attributeValues?.master_name)}
            </Paragraph>
            <Paragraph color={'primary'} size={12}>
              {master_text ? `${role} ${master_text}` : role}
            </Paragraph>
          </View>
          <Rating
            color={'#0EDEFB'}
            shorten={false}
            rating={attrNumber(master?.attributeValues?.master_rating) ?? 0}
          />
          <Paragraph
            className={'w-full'}
            color={'gray'}
            numberOfLines={3}
            size={12}>
            {attrRichText(master?.attributeValues?.master_description)}
          </Paragraph>
        </View>
        <Link
          className={'border-b-sm border-dark relative self-start'}
          href={`/(tabs)/masters/${master?.id}?role=${role}`}>
          <Paragraph
            color={'black'}
            size={13}
            weight={'600'}
            style={{lineHeight: 17}}>
            {check_profile_text}
          </Paragraph>
        </Link>
      </View>
      <View className={'mt-4 mr-2.5'}>
        <Select selected={isSelected} color={appColors.primary} />
      </View>
    </CardBase>
  );
};

export default MasterInMastersCard;
