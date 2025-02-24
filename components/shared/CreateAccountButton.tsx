import React, {memo} from 'react';
import CustomButton from '@/components/shared/CustomButton';
import {useAppSelector} from '@/state/hooks';
import {router} from 'expo-router';

type Props = {};

const CreateAccountButton: React.FC<Props> = ({}) => {
  const {create_account_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  return (
    <CustomButton
      isInline={true}
      paragraphProps={{
        weight: '600',
      }}
      onPress={() => router.navigate('/auth/sign_up')}>
      {create_account_text?.toUpperCase()}
    </CustomButton>
  );
};

export default memo(CreateAccountButton);
