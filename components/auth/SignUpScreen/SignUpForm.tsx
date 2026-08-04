import React, {useEffect, useRef, useState} from 'react';
import {useGetFormByMarkerQuery, useSignUpMutation} from '@/api';
import {IAttributes, IError} from 'oneentry/dist/base/utils';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import CustomInput from '@/components/shared/CustomInput';
import {Alert, StyleSheet, TextInput, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {useAppSelector} from '@/state/hooks';
import Footer from '@/components/shared/Footer';
import {useFormConfig} from '@/lib/useFormConfig';
import {Formik, FormikProps, FormikValues} from 'formik';
import {MaskedTextInput} from 'react-native-mask-text';
import {appColors} from '@/lib/constants/Colors';
import CustomButton from '@/components/shared/CustomButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ISignUpData} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import {router} from 'expo-router';
import {useAuth} from '@/state/contexts/AuthContext';

type Props = {};

const SignUpForm: React.FC<Props> = ({}) => {
  const {data, isLoading} = useGetFormByMarkerQuery({marker: 'reg'});
  const [signUp, {data: signUpData}] = useSignUpMutation();
  const innerRef = useRef<FormikProps<FormikValues>>(null);
  const {signIn} = useAuth();
  const {bottom} = useSafeAreaInsets();

  const {fields, validationSchema, initialValues} = useFormConfig(
    data?.attributes as IAttributes[],
  );
  const {sign_up_text, welcome_message_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const inputRefs = useRef<React.RefObject<TextInput>[]>([]);

  const onSubmit = async (inputs: any) => {
    const formData = Object.entries(inputs).reduce(
      (
        arr: {
          marker: string;
          type: string;
          value: string;
        }[],
        [key, value],
      ) => {
        if (value.length < 1) {
          return arr;
        }

        const candidate = {
          marker: key,
          type: 'string',
          value: value,
        };
        arr.push(candidate);
        return arr;
      },
      [],
    );

    formData.push({
      marker: 'email_notification_reg',
      type: 'string',
      value: inputs.email_reg,
    });

    //Prepare data for sign up submission
    const data: ISignUpData = {
      formIdentifier: 'reg',
      authData: [
        {marker: 'email_reg', value: inputs.email_reg},
        {marker: 'password_reg', value: inputs.password_reg},
      ],
      formData,
      notificationData: {
        email: inputs.email_reg,
        phonePush: [],
        phoneSMS: inputs.phone_reg,
      },
    };

    try {
      const result = await signUp({data}).unwrap();

      console.log(result?.error);
    } catch (e: any) {
      Alert.alert(e?.message);
    }
  };

  useEffect(() => {
    if (signUpData) {
      //Check for activation checkbox
      if (signUpData.isActive) {
        //Sign in activated user
        signIn({
          method: 'email',
          login: signUpData.identifier,
          password: innerRef?.current?.values?.password_reg,
        });
        router.replace('/(tabs)/home');
      } else {
        //If activation required, navigate to activation screen
        router.navigate(
          `/auth/otp_screen?event=activate&identifier=${innerRef?.current?.values?.email_reg}&method=email&password=${innerRef?.current?.values?.password_reg}`,
        );
      }
    }
  }, [signUpData]);

  if (isLoading) {
    return null;
  }

  return (
    <KeyboardAwareScrollView
      className={'pt-10'}
      contentContainerStyle={{gap: 15}}
      showsVerticalScrollIndicator={false}
      bottomOffset={65}>
      <View className={'my-10 gap-2'}>
        <Paragraph size={40} color={'dark'} weight={'600'}>
          {sign_up_text}
        </Paragraph>
        <Paragraph
          className={'leading-7'}
          size={20}
          color={'gray'}
          weight={'400'}>
          {welcome_message_text}
        </Paragraph>
      </View>
      <Formik
        innerRef={innerRef}
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={onSubmit}>
        {({
          values,
          errors,
          handleChange,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
        }) => (
          <>
            {Object.keys(fields)?.map((key, index) => {
              if (key !== 'email_notification_reg') {
                return (
                  <CustomInput
                    // @ts-ignore
                    ref={inputRefs.current[index]}
                    value={values[key]}
                    onSubmitEditing={() => {
                      inputRefs.current[index + 1]?.current?.focus();
                    }}
                    onChangeText={handleChange(key)}
                    autoCapitalize={key === 'email_reg' ? 'none' : 'sentences'}
                    title={fields[key]?.title}
                    placeholder={fields[key]?.placeholder}
                    secureTextEntry={
                      key === 'password_reg' || key === 'repeat_password'
                    }
                    errorMessage={errors[key] ? (errors[key] as string) : ''}
                    key={key + index}
                  />
                );
              }
            })}

            <CustomButton
              style={{
                position: 'absolute',
                alignSelf: 'center',
                bottom: bottom + 20,
              }}
              isLoading={isSubmitting}
              disabled={!isValid}
              title={sign_up_text?.toUpperCase()}
              onPress={handleSubmit}
            />
          </>
        )}
      </Formik>
      <Footer height={50} />
    </KeyboardAwareScrollView>
  );
};

export default SignUpForm;

const styles = StyleSheet.create({
  invalidValue: {
    backgroundColor: '#f8d7d7',
    borderColor: appColors.red,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: appColors.gray,
    width: '100%',
    fontSize: 17,
    paddingVertical: 5,
    paddingBottom: 8,
    fontWeight: '400',
    lineHeight: 22,
  },
  multilineInputStyle: {
    marginTop: 3,
    height: 186,
    paddingTop: 10,
    paddingBottom: 10,
  },
  validStyles: {
    borderColor: appColors.green,
  },
  focusedStyles: {
    borderColor: appColors.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
