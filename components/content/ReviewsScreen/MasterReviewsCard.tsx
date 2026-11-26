import React from 'react';
import {useLocalSearchParams} from 'expo-router';
import {useAppSelector} from '@/state/hooks';
import {getMasterById} from '@/state/reducers/MastersSlice';
import {attrFileUrl, attrNumber, attrText} from '@/lib/oneentry/attributes';
import CustomImage from '@/components/shared/CustomImage';
import {View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import Rating from '@/components/shared/Rating';
import CardBase from '@/components/shared/CardBase';

type Props = {};

const MasterReviewsCard: React.FC<Props> = ({}) => {
  const params = useLocalSearchParams();
  const {master_text, master_experience_text} =
    useAppSelector(state => state.SystemContentReducer?.content);
  const master = useAppSelector(state =>
    // @ts-ignore
    getMasterById(state, parseInt(params.master)),
  );

  return (
    <CardBase
      touchableOpacityProps={{disabled: true}}
      onPress={() => {}}
      className={'flex-row gap-x-4 mt-5'}>
      <CustomImage
        height={72}
        width={62}
        className={'rounded-sm'}
        style={{objectFit: 'cover'}}
        uri={attrFileUrl(master?.attributeValues.master_image)}
      />
      <View className={'flex-1 justify-between'}>
        <View className={'gap-y-2'}>
          <Paragraph color={'dark'} size={18}>
            {attrText(master?.attributeValues.master_name)}
          </Paragraph>
          {params.role && (
            <Paragraph color={'primary'} weight={'600'} size={12}>
              {master_text ? `${params.role} ${master_text}` : params.role}
            </Paragraph>
          )}
          <Paragraph color={'dark'} size={12}>
            {(master_experience_text || 'Experience:') + ' '}
            <Paragraph color={'primary'} size={12}>
              {attrText(master?.attributeValues?.master_expirience)}
            </Paragraph>
          </Paragraph>
          <View className={'flex-row items-center gap-2'}>
            <Rating
              color={'#0EDEFB'}
              shorten={false}
              rating={attrNumber(master?.attributeValues?.master_rating) ?? 0}
            />
          </View>
        </View>
      </View>
    </CardBase>
  );
};

export default MasterReviewsCard;
