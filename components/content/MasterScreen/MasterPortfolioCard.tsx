import React from 'react';
import CardBase from '@/components/shared/CardBase';
import CustomImage from '@/components/shared/CustomImage';
import {Paragraph} from '@/components/shared/Paragraph';
import Rating from '@/components/shared/Rating';
import {Alert, TouchableOpacity, View} from 'react-native';
import CustomButton from '@/components/shared/CustomButton';
import {useAppSelector} from '@/state/hooks';
import {Link, router, useLocalSearchParams} from 'expo-router';
import Reviews from '@/assets/icons/Reviews.svg';

type Props = {
  master?: Record<any, any>;
  id?: number;
  role?: string;
};

const MasterPortfolioCard: React.FC<Props> = ({master, role, id}) => {
  const params = useLocalSearchParams();
  const {book_online_text, master_text, master_experience_text} =
    useAppSelector(state => state.SystemContentReducer?.content);

  const onSelectMaster = () => {
    if (!id) {
      return Alert.alert('No id provided');
    }
    router.navigate(`/(tabs)/catalog/master?id=${id}`);
  };

  if (!master) {
    return <View className={'animate-pulse h-[158px] w-full bg-gray'} />;
  }

  return (
    <CardBase
      touchableOpacityProps={{disabled: true}}
      onPress={() => {}}
      className={'flex-row gap-x-4 mt-5'}>
      <CustomImage
        height={158}
        width={136}
        className={'rounded-lg'}
        style={{objectFit: 'cover'}}
        uri={master?.master_image?.value[0]?.downloadLink}
      />
      <View className={'flex-1 justify-between'}>
        <View className={'gap-y-2'}>
          <Paragraph color={'dark'} size={18}>
            {master?.master_name?.value}
          </Paragraph>
          {role && (
            <Paragraph color={'primary'} weight={'600'} size={12}>
              {role + ' ' + master_text}
            </Paragraph>
          )}
          <Paragraph color={'dark'} size={12}>
            {master_experience_text + ' '}
            <Paragraph color={'primary'} size={12}>
              {master?.master_expirience?.value}
            </Paragraph>
          </Paragraph>
          <View className={'flex-row items-center gap-3'}>
            <Rating
              color={'#0EDEFB'}
              shorten={false}
              rating={master?.master_rating?.value}
            />
            <Link
              href={`/(tabs)/masters/reviews?master=${params.master}?role=${role}`}
            >
              <View className={'flex-row items-center gap-2'}>
                <Reviews />
                <Paragraph color={'dark'} size={18} weight={'400'}>
                  1
                </Paragraph>
              </View>
            </Link>
          </View>
        </View>
        <CustomButton
          onPress={onSelectMaster}
          type={'sm'}
          isInline
          title={book_online_text}
        />
      </View>
    </CardBase>
  );
};

export default MasterPortfolioCard;
