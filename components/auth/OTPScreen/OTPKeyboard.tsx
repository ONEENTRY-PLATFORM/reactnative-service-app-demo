import React, {Dispatch, memo, useContext, useEffect} from 'react';
import {Alert, Keyboard, View} from 'react-native';
import {useRoute} from "expo-router/react-navigation";
import {IError} from 'oneentry/dist/base/utils';
import useTextManager from './hooks/useTextManager';
import {useAppSelector} from '@/state/hooks';
import CustomButton from '@/components/shared/CustomButton';
import {Redirect, router, useLocalSearchParams} from 'expo-router';
import {useActivateMeMutation} from '@/api';
import {useAuth} from '@/state/contexts/AuthContext';
import {useHistoryContext} from '@/state/contexts/HistoryProvider';
import {api} from '@/api/defineApi';

type Props = {
  setValue: Dispatch<string>;
  value: string;
};

const OtpKeyboard: React.FC<Props> = ({setValue, value}) => {
  const {verify_now_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const [activateUser, {data}] = useActivateMeMutation();
  const {signIn, user} = useAuth();
  const params = useLocalSearchParams();
  const {lastVisitedTab} = useHistoryContext();

  const onSubmitPress = async () => {
    if (value.length < 6) {
      return;
    }
    Keyboard.dismiss();
    try {
      if (params.event === 'activate') {
        if (params.method && params.password) {
          activateUser({
            marker: params.method as string,
            identifier: params.identifier as string,
            code: value,
          });
        }
      }

      if (params.event === 'reset') {
        // const result = await api.AuthProvider.checkCode(
        //   'generate_otp',
        //   params.identifier as string,
        //   value,
        // );
        //
        // if ((result as IError)?.statusCode >= 400) {
        //   throw new Error((result as IError)?.message);
        // }

        router.navigate(
          `/auth/new_password?code=${value}&identifier=${params.identifier}&marker=${params.method || 'email'}`,
        );
      }
    } catch (e: any) {
      Alert.alert(e.message);
    }
  };

  useEffect(() => {
    if (data) {
      signIn({
        method: params.method as string,
        login: params.identifier as string,
        password: params.password as string,
      });
    }
  }, [data]);

  const {onSubmit} = useTextManager({
    maxLength: 6,
    onPress: setValue,
    onSubmitPress,
  });

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
    <View className={'items-center justify-center'}>
      <CustomButton
        onPress={onSubmit}
        title={verify_now_text}
        disabled={value.length < 6}
      />
    </View>
  );
};

export default memo(OtpKeyboard);
