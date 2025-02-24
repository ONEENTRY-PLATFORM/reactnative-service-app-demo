import React from 'react';
import {Stack} from 'expo-router';
import CustomHeader from '@/components/shared/CustomHeader';
import {useAppSelector} from '@/state/hooks';

const AuthLayout: React.FC = ({}) => {
  const {verification, forgot_password_text} = useAppSelector(state => state.SystemContentReducer.content);

  return (
    <Stack
      screenOptions={{
        header: props => <CustomHeader isAuth={true} {...props} />,
        contentStyle: {backgroundColor: 'white'},
      }}>
      <Stack.Screen name={'index'} />
      <Stack.Screen name={'otp_screen'} options={{title: verification}} />
      <Stack.Screen name={'reset'} options={{title: forgot_password_text}} />
      <Stack.Screen name={'sign_in'} />
      <Stack.Screen name={'sign_up'} />
    </Stack>
  );
};

export default AuthLayout;
