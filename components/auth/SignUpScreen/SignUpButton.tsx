import React, {useEffect, useMemo} from 'react';
import CustomButton from '@/components/shared/CustomButton';
import {useAppSelector} from '@/state/hooks';
import {Alert} from 'react-native';
import {ISignUpData} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSignUpMutation} from '@/api';
import {useAuth} from '@/state/contexts/AuthContext';
import {router} from 'expo-router';

type Props = {
  inputs: {[key: string]: InputValue};
};

const SignUpButton: React.FC<Props> = ({inputs}) => {
  const [signUp, {isLoading, error, data}] = useSignUpMutation();
  const {signIn, isLoading: isLoadingAuth} = useAuth();
  const {sign_up_text, incorrect_inputs_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );

  const isValid = useMemo(() => {
    return !Object.entries(inputs).some(([key, value]) => {
      return !value?.valid;
    });
  }, [inputs]);

  const onSubmit = async () => {
    if (!isValid) {
      return Alert.alert(incorrect_inputs_text || '');
    }

    const formData = Object.entries(inputs).reduce(
      (
        arr: {
          marker: string;
          type: string;
          value: string;
        }[],
        [key, value],
      ) => {
        if (key === 'phone_reg' && value.value.length === 1) {
          return arr;
        }

        const candidate = {
          marker: key,
          type: 'string',
          value: value.value,
        };
        arr.push(candidate);
        return arr;
      },
      [],
    );

    formData.push({
      marker: 'email_notification_reg',
      type: 'string',
      value: inputs.email_reg.value,
    });

    //Prepare data for sign up submission
    const data: ISignUpData = {
      formIdentifier: 'reg',
      authData: [
        {marker: 'email_reg', value: inputs.email_reg.value},
        {marker: 'password_reg', value: inputs.password_reg.value},
      ],
      formData,
      notificationData: {
        email: inputs.email_reg.value,
        phonePush: [],
        phoneSMS:
          inputs.phone_reg.value?.length > 1
            ? inputs.phone_reg.value
            : '+19991234567',
      },
    };

    try {
      await signUp({data});
    } catch (e: any) {
      Alert.alert(e?.message);
    }
  };

  //User registered action
  useEffect(() => {
    if (data) {
      //Check for activation checkbox
      if (data.isActive) {
        //Sign in activated user
        signIn({
          method: 'email',
          login: data.identifier,
          password: inputs?.password_reg.value,
        });
        router.navigate('/(tabs)/home');
      } else {
        //If activation required, navigate to activation screen
        router.navigate(
          `/auth/otp_screen?event=activate&identifier=${inputs?.email_reg?.value}&method=email&password=${inputs?.password_reg?.value}`,
        );
      }
    }
  }, [data]);

  useEffect(() => {
    if (error) Alert.alert(error.toString());
  }, [error]);

  return (
    <>

    </>
  );
};

export default SignUpButton;
