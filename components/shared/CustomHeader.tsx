import React, {Dispatch, useState} from 'react';
import {Modal, TouchableOpacity, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import {BottomTabHeaderProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import GoBackButton from '@/components/shared/GoBackButton';
import Chat from '@/assets/icons/Chat.svg';
import FloatingModal from '@/components/shared/FloatingModal';
import Phone from '@/assets/icons/Phone.svg';
import WhatsApp from '@/assets/icons/WhatsApp.svg';
import {appColors} from '@/constants/Colors';
import {useAppSelector} from '@/state/hooks';
import CustomImage from '@/components/shared/CustomImage';
import {useSegments} from 'expo-router';

const ChatModal = ({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: Dispatch<boolean>;
}) => {
  return (
    <FloatingModal
      visible={visible}
      setVisible={setVisible}
      pressableProps={{
        style: {alignItems: 'center', justifyContent: 'center'},
      }}>
      <View className={'w-screen px-layout'}>
        <View
          className={
            'rounded-md items-center justify-center gap-y-10 px-layout py-10 bg-white w-full'
          }>
          <View
            className={
              'items-center justify-center w-full bg-primary p-2 rounded-sm'
            }>
            <Paragraph color={'white'} size={18}>
              Would you like to call?
            </Paragraph>
          </View>
          <View className={'flex-row gap-5'}>
            <Phone />
            <WhatsApp />
          </View>
        </View>
      </View>
    </FloatingModal>
  );
};

type Props = (NativeStackHeaderProps | BottomTabHeaderProps) & {
  isAuth?: boolean;
};

const CustomHeader: React.FC<Props> = ({isAuth = false, ...props}) => {
  const [visible, setVisible] = useState(false);
  const {oneentry_logo} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const {top} = useSafeAreaInsets();
  const {options} = props;
  const segments = useSegments();

  // The last segment in the route array is typically the screen name
  const currentScreen = segments[segments.length - 1];
  console.log(currentScreen);

  return (
    <View
      style={{backgroundColor: !isAuth ? appColors.primary : 'transparent'}}>
      <View
        style={{marginTop: top}}
        className={`h-14 ${!isAuth && 'bg-primary'} w-full justify-between items-center px-layout flex-row`}>
        <GoBackButton style={!isAuth ? 'default' : 'gray'} />

        <View
          className={
            'absolute w-screen h-full items-center justify-center z-0'
          }>
          {isAuth &&
          currentScreen !== 'otp_screen' &&
          currentScreen !== 'reset' &&
          currentScreen !== 'auth' ? (
            <CustomImage width={162} height={45} uri={oneentry_logo} />
          ) : (
            <Paragraph size={20} weight={'600'} color={isAuth ? 'dark' : 'white'}>
              {options.title}
            </Paragraph>
          )}
        </View>

        {!isAuth && (
          <View>
            <TouchableOpacity onPress={() => setVisible(true)}>
              <Chat />
            </TouchableOpacity>
            <ChatModal visible={visible} setVisible={setVisible} />
          </View>
        )}
      </View>
    </View>
  );
};

export default CustomHeader;
