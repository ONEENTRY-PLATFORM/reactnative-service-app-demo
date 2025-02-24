import React, {Dispatch, useEffect, useRef, useState} from 'react';
import {useGetFormByMarkerQuery} from '@/api';
import {IAttributes} from 'oneentry/dist/base/utils';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import CustomInput from '@/components/shared/CustomInput';
import PasswordInput from '@/components/shared/PasswordInput';
import {TextInput, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {useAppSelector} from '@/state/hooks';

type Props = {
  inputs: {[key: string]: InputValue};
  setInputs: Dispatch<any>;
};

const SignUpForm: React.FC<Props> = ({inputs, setInputs}) => {
  const {data, isLoading} = useGetFormByMarkerQuery({marker: 'reg'});
  const {sign_up_text, welcome_message_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const inputRefs = useRef<React.RefObject<TextInput>[]>([]);
  const [repeat, setRepeat] = useState('');

  useEffect(() => {
    if (!data) {
      return;
    }

    setInputs(
      data.attributes
        ?.filter(
          (input: IAttributes) => input.marker !== 'email_notification_reg',
        )
        .reduce((obj: {[key: string]: InputValue}, input: IAttributes) => {
          obj[input.marker] = {
            value: input.marker === 'phone_reg' ? '+' : '',
            valid: !input.validators?.requiredValidator,
          };

          return obj;
        }, {}),
    );

    inputRefs.current = data.attributes.map(() => React.createRef());
  }, [data]);

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
        <Paragraph className={'leading-7'} size={20} color={'gray'} weight={'400'}>
          {welcome_message_text}
        </Paragraph>
      </View>
      {/*Input fields from CMS in correct order*/}
      {data?.attributes?.map((item: IAttributes, index: number) => {
        if (item?.marker === 'password_reg') {
          return (
            <PasswordInput
              value={inputs[item?.marker] || {valid: true, value: ''}}
              setValue={value =>
                setInputs((prevState: any) => {
                  return {
                    ...prevState,
                    [item.marker]: value,
                  };
                })
              }
              validators={item.validators}
              repeatPassword={repeat}
              setRepeatPassword={setRepeat}
              key={item?.marker + index}
            />
          );
        }

        if (item?.marker !== 'email_notification_reg') {
          return (
            <CustomInput
              // @ts-ignore
              ref={inputRefs.current[index]}
              value={inputs[item.marker] || {valid: true, value: ''}}
              onSubmitEditing={() => {
                inputRefs.current[index + 1]?.current?.focus();
              }}
              setValue={value =>
                setInputs((prevState: any) => {
                  return {
                    ...prevState,
                    [item.marker]: value,
                  };
                })
              }
              autoCapitalize={
                item.marker === 'email_reg' ? 'none' : 'sentences'
              }
              title={item?.localizeInfos?.title}
              validators={item.validators}
              key={item?.marker + index}
            />
          );
        }

        return null;
      })}
      <View className={'h-10'} />
    </KeyboardAwareScrollView>
  );
};

export default SignUpForm;
