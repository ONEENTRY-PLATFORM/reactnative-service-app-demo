import React from 'react';
import {FlatList, View} from 'react-native';
import CardBase from '@/components/shared/CardBase';
import {appColors} from '@/lib/constants/Colors';
import {Paragraph} from '@/components/shared/Paragraph';
import Rating from '@/components/shared/Rating';

const Review = ({review}: {review: any}) => {
  return (
    <CardBase
      outline
      style={{paddingHorizontal: 20, paddingVertical: 15, gap: 25}}
      outlineColor={appColors.primary}
      touchableOpacityProps={{className: 'rounded-lg'}}
      onPress={() => {}}>
      <View className={'flex-row justify-between items-center'}>
        <Paragraph size={21} weight={'500'} color={'dark'}>
          {review.author}
        </Paragraph>
        <Rating rating={review.rating} color={appColors.blue} />
      </View>
      <Paragraph size={16} weight={'400'} color={'dark'}>
        {review.review}
      </Paragraph>
    </CardBase>
  );
};
type Props = {};

const reviews = [
  {
    author: 'Marina',
    rating: 4,
    review:
      'Lorem ipsum dolor sit amet consectetur. Lectus egestas pretium elementum facilisis eget scelerisque.',
  },
];
const MasterReviewsList: React.FC<Props> = ({}) => {
  return (
    <FlatList
      data={reviews}
      renderItem={({item}) => <Review review={item} />}
    />
  );
};

export default MasterReviewsList;
