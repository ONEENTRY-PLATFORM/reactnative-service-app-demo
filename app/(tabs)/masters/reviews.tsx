import React, {useState} from 'react';
import {View} from 'react-native';
import {router, useLocalSearchParams} from 'expo-router';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {Screen} from '@/components/shared/Screen';
import CustomButton from '@/components/shared/CustomButton';
import MasterReviewsCard from '@/components/content/ReviewsScreen/MasterReviewsCard';
import MasterReviewsList from '@/components/content/ReviewsScreen/MasterReviewsList';
import LeaveReviewForm from '@/components/content/ReviewsScreen/LeaveReviewForm';
import {useAuth} from '@/state/contexts/AuthContext';
import {useAppSelector} from '@/state/hooks';

type Props = {};

const Reviews: React.FC<Props> = ({}) => {
  const params = useLocalSearchParams<{master?: string; action?: string}>();
  const {user} = useAuth();
  const {leave_review_text} =
    useAppSelector(state => state.SystemContentReducer?.content) ?? {};
  const masterId = parseInt(params.master ?? '', 10) || undefined;
  // Tab routes stay mounted, so a later visit arrives as a param change, not a
  // fresh mount. A local toggle only applies to the params it was made for;
  // new params fall back to what `action` asks for.
  const routeKey = `${params.master ?? ''}|${params.action ?? ''}`;
  const [toggle, setToggle] = useState<{key: string; open: boolean} | null>(
    null,
  );
  const showForm =
    toggle?.key === routeKey ? toggle.open : params.action === 'leave';
  const setShowForm = (open: boolean) => setToggle({key: routeKey, open});

  // Reviews are tied to a customer account; guests are sent to sign in
  // instead of seeing a form that cannot submit.
  const openForm = () => {
    if (!user) {
      router.navigate('/auth/sign_in');
      return;
    }
    setShowForm(true);
  };

  return (
    <Screen isFlex edges={['top', 'horizontal']}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        bottomOffset={40}
        contentContainerStyle={{gap: 28, paddingBottom: 120}}>
        <MasterReviewsCard />
        {masterId ? (
          showForm && user ? (
            <LeaveReviewForm
              masterId={masterId}
              onSubmitted={() => setShowForm(false)}
            />
          ) : (
            <View>
              <CustomButton
                isInline
                title={leave_review_text || 'Leave a review'}
                onPress={openForm}
              />
            </View>
          )
        ) : null}
        <MasterReviewsList masterId={masterId} />
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default Reviews;
