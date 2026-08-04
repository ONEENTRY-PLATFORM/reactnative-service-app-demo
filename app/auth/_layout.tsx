import React from 'react';
import {Stack} from 'expo-router';
import CustomHeader from '@/components/shared/CustomHeader';
import {useAppSelector} from '@/state/hooks';

const AuthLayout: React.FC = ({}) => {
  const {verification, forgot_password_text, reset_password_text} =
    useAppSelector(state => state.SystemContentReducer.content);

  return (
    <Stack
      screenOptions={{
        header: props => <CustomHeader isAuth={true} {...props} />,
        contentStyle: {backgroundColor: 'white'},
        statusBarBackgroundColor: 'white',
      }}>
      <Stack.Screen name={'index'} />
      <Stack.Screen name={'otp_screen'} options={{title: verification}} />
      {/* Auth screens draw their own header inside the page — hide the
          stack header so the pink card can extend to the top. */}
      <Stack.Screen
        name={'reset'}
        options={{title: forgot_password_text, headerShown: false}}
      />
      <Stack.Screen
        name={'new_password'}
        options={{title: reset_password_text, headerShown: false}}
      />
      <Stack.Screen name={'sign_in'} options={{headerShown: false}} />
      <Stack.Screen name={'sign_up'} options={{headerShown: false}} />
    </Stack>
  );
};

export default AuthLayout;
