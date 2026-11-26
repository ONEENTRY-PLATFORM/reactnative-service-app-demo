import React, {useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import Toast from 'react-native-toast-message';
import Star from '@/assets/icons/Star.svg';
import CardBase from '@/components/shared/CardBase';
import CustomButton from '@/components/shared/CustomButton';
import CustomInput from '@/components/shared/CustomInput';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {useAuth} from '@/state/contexts/AuthContext';
import {getUserDisplayName, submitReview} from '@/lib/oneentry/reviews';

const STARS = [1, 2, 3, 4, 5];

const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => (
  <View className={'flex-row gap-3'}>
    {STARS.map(star => (
      <TouchableOpacity
        key={star}
        accessibilityRole={'button'}
        accessibilityLabel={`${star} star${star > 1 ? 's' : ''}`}
        hitSlop={6}
        onPress={() => onChange(star)}>
        <Star
          width={32}
          height={32}
          fill={star <= value ? appColors.blue : appColors.slate200}
        />
      </TouchableOpacity>
    ))}
  </View>
);

type Props = {
  masterId: number;
  onSubmitted?: () => void;
};

const LeaveReviewForm: React.FC<Props> = ({masterId, onSubmitted}) => {
  const {user} = useAuth();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const canSubmit = rating > 0 && text.trim().length > 0 && !sending;

  const onSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    setSending(true);
    const result = await submitReview({
      masterId,
      rating,
      text: text.trim(),
      author: getUserDisplayName(user),
    });
    setSending(false);
    if (!result.ok) {
      Toast.show({
        type: 'error',
        text1: 'Review not sent',
        text2: result.error,
      });
      return;
    }
    // The form pre-moderates, so the review is not in the list yet — promise
    // moderation rather than an immediate appearance.
    Toast.show({
      type: 'success',
      text1: 'Thank you!',
      text2: 'Your review will appear after moderation.',
    });
    setRating(0);
    setText('');
    onSubmitted?.();
  };

  return (
    <CardBase
      outline
      outlineColor={appColors.primary}
      touchableOpacityProps={{className: 'rounded-lg', disabled: true}}
      onPress={() => {}}
      style={{paddingHorizontal: 20, paddingVertical: 18, gap: 16}}>
      <Paragraph size={18} weight={'500'} color={'dark'}>
        Leave a review
      </Paragraph>
      <StarPicker value={rating} onChange={setRating} />
      <CustomInput
        multiline
        textAlignVertical={'top'}
        placeholder={'Share your experience'}
        value={text}
        onChangeText={setText}
        maxLength={2000}
      />
      <CustomButton
        title={'Submit review'}
        disabled={!canSubmit}
        isLoading={sending}
        onPress={onSubmit}
      />
    </CardBase>
  );
};

export default LeaveReviewForm;
