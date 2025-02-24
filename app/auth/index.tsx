import React from 'react';
import {Screen} from '@/components/shared/Screen';
import {
  AuthMethodsList,
  PolicyLink,
  WelcomeHeader,
} from '@/components/auth/WelcomeScreen';

type Props = {};

const WelcomeScreen: React.FC<Props> = ({}) => {
  return (
    <Screen style={{height: '90%'}} edges={['horizontal', 'bottom']}>
      <WelcomeHeader />
      <AuthMethodsList />
      <PolicyLink />
    </Screen>
  );
};

export default WelcomeScreen;
