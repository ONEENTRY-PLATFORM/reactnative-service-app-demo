import React from 'react';
import CustomButton from '@/components/shared/CustomButton';
import {useAppSelector} from '@/state/hooks';
import {useAuth} from '@/state/contexts/AuthContext';
import {Redirect} from 'expo-router';
import {useHistoryContext} from '@/state/contexts/HistoryProvider';

type Props = {
  login: string;
  password: string;
};

const SignInButton: React.FC<Props> = ({login, password}) => {
  const {sign_in_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const {signIn, isLoading, user} = useAuth();
  const {lastVisitedTab} = useHistoryContext();

  if (user) {
    return (
      <Redirect
        // @ts-ignore
        href={
          lastVisitedTab ? `/(tabs)/${lastVisitedTab}` : '/(tabs)/home'
        }
      />
    );
  }

  return (
    <CustomButton
      title={sign_in_text?.toUpperCase()}
      isLoading={isLoading}
      onPress={() => {
        signIn({
          method: 'email',
          login,
          password,
        });
      }}
    />
  );
};

export default SignInButton;
