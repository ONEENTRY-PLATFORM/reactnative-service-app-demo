import React from 'react';
import {Screen} from '@/components/shared/Screen';
import MasterReviewsCard from '@/components/content/ReviewsScreen/MasterReviewsCard';
import MasterReviewsList from '@/components/content/ReviewsScreen/MasterReviewsList';

type Props = {};

const Reviews: React.FC<Props> = ({}) => {
  return (
    <Screen className={'gap-7'} edges={['top', 'horizontal']}>
      <MasterReviewsCard />
      <MasterReviewsList />
    </Screen>
  );
};

export default Reviews;
