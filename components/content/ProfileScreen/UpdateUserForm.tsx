import React, {Dispatch, memo, useEffect, useRef, useState} from 'react';
import {Alert, TextInput, View} from 'react-native';
import {IAuthFormData} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useAuth} from '@/state/contexts/AuthContext';
import {useAppSelector} from '@/state/hooks';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';
import {useUpdateMeMutation} from '@/api';

type Props = {};

const UpdateUserForm: React.FC<Props> = ({}) => {
  const {phone_text, save_button_text, exit_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const [nameValue, setNameValue] = useState<InputValue>({
    value: '',
    valid: true,
  });
  const [phoneValue, setPhoneValue] = useState<InputValue>({
    value: '',
    valid: true,
  });
  const {user, logOut} = useAuth();
  const usernameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const [updateMe, {isLoading}] = useUpdateMeMutation();

  const onUpdateUserData = async () => {
    try {
      //Transform data to IAuthFormData
      const formData: IAuthFormData[] = [];

      if (nameValue) {
        formData.push({
          marker: 'name_reg',
          value: nameValue.value,
          type: 'string',
        });
      }

      if (phoneValue) {
        formData.push({
          marker: 'phone_reg',
          value: phoneValue.value,
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
          console.log(item);
          setPhoneValue({value: item.value, valid: true});
        }

        if (item.marker === 'name_reg') {
          setNameValue({value: item.value, valid: true});
        }
      });
    }
  }, [user]);

  const onUpdateNameValue = (value: InputValue) => {
    setNameValue(value);
  };

  const onUpdatePhoneValue = (value: InputValue) => {
    setPhoneValue(value);
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{flex: 1, justifyContent: 'space-between'}}
      bottomOffset={65}>
      <View style={{gap: 10}}>
        <CustomInput
          value={nameValue}
          setValue={onUpdateNameValue}
          title={'Name'}
          placeholder={'Name'}
          validators={{requiredValidator: {}}}
          onSubmitEditing={() => phoneRef?.current?.focus()}
          ref={usernameRef}
        />
        <CustomInput
          value={phoneValue}
          setValue={onUpdatePhoneValue}
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
      </View>
    </KeyboardAwareScrollView>
  );
};

export default memo(UpdateUserForm);
