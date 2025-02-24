import React, {Dispatch, useEffect, useRef, useState} from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAppSelector} from '@/state/hooks';
import {useGenerateOTPMutation} from '@/api';
import {Paragraph} from '@/components/shared/Paragraph';
import {useLocalSearchParams} from 'expo-router';

type Props = {
  value: string;
  setValue: Dispatch<string>;
};

const numbers = Array.from({length: 6}, (_, i) => i);
const CODE_LENGTH = numbers.length;

const OTPInput: React.FC<Props> = ({value, setValue}) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const params = useLocalSearchParams();
  const ref = useRef<TextInput>(null);
  const [generateOTP, {error, data}] = useGenerateOTPMutation();
  const {enter_otp_code, receive_otp_text, resend_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );

  const onResend = async () => {
    await generateOTP({
      marker: 'email',
      identifier: (params.identifier as string) || '',
      event: 'generate_otp',
    });
  };

  useEffect(() => {
    if (error) {
      Alert.alert(error.toString());
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      setTimeLeft(60);
    }
  }, [data]);

  useEffect(() => {
    if (timeLeft === 0) return; // Stop the timer when it reaches 0

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000); // Decrease timeLeft by 1 every second

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleOnPress = () => {
    setIsKeyboardOpen(true);
    ref?.current?.focus();
  };

  // Functionalities to close the keyboard when it is hidden
  useEffect(() => {
    Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardOpen(false);
    });
  }, []);

  const digitComponent = ({i}: {i: number}) => {
    const isCurrentDigit = i === value.length;
    const isLastDigit = i === CODE_LENGTH - 1;
    const isCodeFull = value.length === CODE_LENGTH;

    const isFocused =
      isKeyboardOpen && (isCurrentDigit || (isLastDigit && isCodeFull));

    const style = `h-[60px] w-10 items-center justify-center bg-[#F6F7F9] rounded-xxs ${
      isFocused && 'border-sm border-darkGray'
    }`;

    return (
      <Pressable onPress={handleOnPress} key={'Code' + i} className={style}>
        {value?.[i] && (
          <Paragraph size={20} weight={'500'} color={'dark'}>
            {value[i]}
          </Paragraph>
        )}
      </Pressable>
    );
  };

  return (
    <View className={'justify-center pt-16 gap-4 px-2'}>
      <Paragraph size={20}>{enter_otp_code}</Paragraph>
      <View className={'flex-row justify-between'}>
        {/* Hidden TextInput to handle the keyboard with autocomplete */}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={setValue}
          keyboardType="number-pad"
          returnKeyType="done"
          textContentType="oneTimeCode"
          autoComplete={'one-time-code'}
          maxLength={numbers?.length}
          className={'absolute h-0 w-0 opacity-0'}
        />
        {/* OTP Input */}
        {numbers.map((_, i) => digitComponent({i}))}
      </View>
      <View className={'flex-row justify-end gap-2'}>
        <Paragraph size={18}>{receive_otp_text}</Paragraph>
        <TouchableOpacity disabled={timeLeft > 0} onPress={onResend}>
          <Paragraph color={'blue'} weight={'600'} size={18}>
            {timeLeft > 0 ? timeLeft.toString() : resend_text}
          </Paragraph>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OTPInput;
