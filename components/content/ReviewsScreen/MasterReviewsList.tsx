import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import dayjs from 'dayjs';
import CardBase from '@/components/shared/CardBase';
import {appColors} from '@/lib/constants/Colors';
import {Paragraph} from '@/components/shared/Paragraph';
import Rating from '@/components/shared/Rating';
import EmptyState from '@/components/shared/EmptyState';
import {CmsReview, useMasterReviews} from '@/lib/oneentry/reviews';

const Review = ({review}: {review: CmsReview}) => {
  const date = dayjs(review.date);
  return (
    <CardBase
      outline
      style={{paddingHorizontal: 20, paddingVertical: 15, gap: 12}}
      outlineColor={appColors.primary}
      touchableOpacityProps={{className: 'rounded-lg', disabled: true}}
      onPress={() => {}}>
      <View className={'flex-row justify-between items-center gap-3'}>
        <Paragraph
          size={18}
          weight={'500'}
          color={'dark'}
          numberOfLines={1}
          style={{flexShrink: 1}}>
          {review.author || 'Client'}
        </Paragraph>
        <Rating rating={review.rating} color={appColors.blue} />
      </View>
      {date.isValid() && (
        <Paragraph size={12} color={'gray'}>
          {date.format('MMM D, YYYY')}
        </Paragraph>
      )}
      <Paragraph size={16} weight={'400'} color={'dark'}>
        {review.text}
      </Paragraph>
    </CardBase>
  );
};

type Props = {
  masterId?: number;
};

// Rendered inside the screen's ScrollView, so a plain map instead of a
// FlatList (nested virtualized lists warn and break scrolling).
const MasterReviewsList: React.FC<Props> = ({masterId}) => {
  const {reviews, loading, error} = useMasterReviews(masterId);

  if (loading && reviews.length === 0) {
    return <ActivityIndicator color={appColors.primary} />;
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        compact
        title={error ? 'Reviews unavailable' : 'No reviews yet'}
        description={
          error
            ? 'We could not load reviews. Please try again later.'
            : 'Be the first to share your experience with this specialist.'
        }
      />
    );
  }

  return (
    <View style={{gap: 12}}>
      {reviews.map(review => (
        <Review key={review.id} review={review} />
      ))}
    </View>
  );
};

export default MasterReviewsList;
