import React, {Dispatch, memo, useEffect, useRef, useState} from 'react';
import {Alert, View} from 'react-native';
import type {TextInputInstance} from 'react-native';
import {FormDataType} from 'oneentry/dist/forms-data/formsDataInterfaces';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useAuth} from '@/state/contexts/AuthContext';
import {useAppSelector} from '@/state/hooks';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';
import {useUpdateMeMutation} from '@/api';
import DeleteAccountButton from '@/components/content/ProfileScreen/DeleteAccountButton';

type Props = {};

const UpdateUserForm: React.FC<Props> = ({}) => {
  const {phone_text, save_button_text, exit_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const [nameValue, setNameValue] = useState<string>('');
  const [phoneValue, setPhoneValue] = useState<string>('');
  const {user, logOut} = useAuth();
  const usernameRef = useRef<TextInputInstance>(null);
  const phoneRef = useRef<TextInputInstance>(null);
  const [updateMe, {isLoading}] = useUpdateMeMutation();

  const onUpdateUserData = async () => {
    try {
      //Transform data to IAuthFormData
      const formData: FormDataType[] = [];

      if (nameValue) {
        formData.push({
          marker: 'name_reg',
          value: nameValue,
          type: 'string',
        });
      }

      if (phoneValue) {
        formData.push({
          marker: 'phone_reg',
          value: phoneValue,
          type: 'string',
        });
      }

      if (user?.formIdentifier) {
        updateMe({formIdentifier: user?.formIdentifier, formData});
      }

      //Close keyboard and set editing to false
      usernameRef.current?.blur();
      phoneRef.current?.blur();
    } catch (e: any) {
      Alert.alert(e.message);
      console.error(e);
    }
  };

  const onExitUser = async () => {
    try {
      logOut();
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    // @ts-ignore
    const fields = user?.formData;
    //Fill inputs with user data
    if (fields) {
      fields.map(item => {
        if (item.marker === 'phone_reg') {
          setPhoneValue(String(item.value ?? ''));
        }

        if (item.marker === 'name_reg') {
          setNameValue(String(item.value ?? ''));
        }
      });
    }
  }, [user]);

  const onUpdateNameValue = (value: string) => {
    setNameValue(value);
  };

  const onUpdatePhoneValue = (value: string) => {
    setPhoneValue(value);
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{flex: 1, justifyContent: 'space-between'}}
      bottomOffset={40}>
      <View style={{gap: 10}}>
        <CustomInput
          value={nameValue}
          onChangeText={onUpdateNameValue}
          title={'Name'}
          placeholder={'Name'}
          onSubmitEditing={() => phoneRef?.current?.focus()}
          ref={usernameRef}
        />
        <CustomInput
          value={phoneValue}
          onChangeText={onUpdatePhoneValue}
          placeholder={phone_text}
          title={phone_text}
          keyboardType={'phone-pad'}
          ref={phoneRef}
        />
      </View>
      <View className={'gap-y-5'}>
        <CustomButton isLoading={isLoading} onPress={onUpdateUserData}>
          {save_button_text}
        </CustomButton>
        <CustomButton isInline onPress={onExitUser}>
          {exit_text}
        </CustomButton>
        <DeleteAccountButton />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default memo(UpdateUserForm);
