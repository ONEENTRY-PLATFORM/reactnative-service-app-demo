import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {router, useLocalSearchParams} from 'expo-router';
import {ChevronLeft, Eye, EyeOff, Lock} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import type {IError} from 'oneentry/dist/base/utils';
import {api} from '@/api/defineApi';
import {Screen} from '@/components/shared/Screen';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {useAppSelector} from '@/state/hooks';

// Forgot-password step 2 — set the new password after the OTP is confirmed.
// Same rounded-field / big-CTA language as the other auth screens.

const NewPassword: React.FC = () => {
  const dict = useAppSelector(state => state.SystemContentReducer.content) ?? {};
  const {code, marker, identifier} = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const passwordsMatch = password.length > 0 && password === repeat;

  const onReset = async () => {
    if (!passwordsMatch) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.AuthProvider.changePassword(
        marker as string,
        identifier as string,
        'reset_password',
        2,
        code as string,
        password,
        password,
      );
      if ((result as IError)?.statusCode >= 400) {
        throw new Error((result as IError)?.message ?? 'Failed');
      }
      if (result) {
        Toast.show({type: 'success', text1: 'Password changed!'});
        router.replace('/auth/sign_in');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen isFull edges={['top', 'horizontal', 'bottom']}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps={'handled'}
          showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={styles.backBtn}>
              <ChevronLeft size={22} color={appColors.charcoal} />
            </TouchableOpacity>
          </View>

          <View style={{gap: 8, marginTop: 20}}>
            <Paragraph size={30} weight={'700'} color={'charcoal'}>
              {(dict.new_password_text as string) || 'New password'}
            </Paragraph>
            <Paragraph size={14} color={'gray'} style={{lineHeight: 20}}>
              {(dict.new_password_description as string) ||
                'Choose a new password for your account. It has to be at least 8 characters.'}
            </Paragraph>
          </View>

          <View style={{gap: 14, marginTop: 30}}>
            <Field
              label={'New password'}
              icon={<Lock size={18} color={appColors.gray} />}
              value={password}
              onChangeText={setPassword}
              placeholder={'••••••••'}
              secureTextEntry={!show}
              autoCapitalize={'none'}
              autoComplete={'off'}
              textContentType={'none'}
              passwordRules={''}
              trailing={
                <TouchableOpacity
                  onPress={() => setShow(v => !v)}
                  activeOpacity={0.7}>
                  {show ? (
                    <EyeOff size={18} color={appColors.gray} />
                  ) : (
                    <Eye size={18} color={appColors.gray} />
                  )}
                </TouchableOpacity>
              }
            />
            <Field
              label={'Confirm password'}
              icon={<Lock size={18} color={appColors.gray} />}
              value={repeat}
              onChangeText={setRepeat}
              placeholder={'••••••••'}
              secureTextEntry={!show}
              autoCapitalize={'none'}
              autoComplete={'off'}
              textContentType={'none'}
              passwordRules={''}
            />

            {repeat.length > 0 && !passwordsMatch ? (
              <Paragraph size={12} color={'red'}>
                Passwords don't match.
              </Paragraph>
            ) : null}
            {error ? (
              <Paragraph size={12} color={'red'}>
                {error}
              </Paragraph>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={onReset}
            disabled={!passwordsMatch || loading}
            activeOpacity={0.9}
            style={[
              styles.cta,
              (!passwordsMatch || loading) && styles.ctaDisabled,
            ]}>
            {!passwordsMatch || loading ? null : (
              <LinearGradient
                colors={['#f60efb', '#ed21f1']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={StyleSheet.absoluteFill}
              />
            )}
            {loading ? (
              <ActivityIndicator size={'small'} color={appColors.white} />
            ) : (
              <Paragraph
                size={14}
                weight={'700'}
                style={{
                  color: passwordsMatch ? appColors.white : appColors.gray,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}>
                {(dict.reset_password_text as string) || 'Reset password'}
              </Paragraph>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const Field: React.FC<
  React.ComponentProps<typeof TextInput> & {
    label: string;
    icon?: React.ReactNode;
    trailing?: React.ReactNode;
  }
> = ({label, icon, trailing, ...rest}) => (
  <View style={{gap: 6}}>
    <Paragraph
      size={11}
      weight={'700'}
      color={'gray'}
      style={{textTransform: 'uppercase', letterSpacing: 1.2}}>
      {label}
    </Paragraph>
    <View style={styles.fieldBox}>
      {icon ? <View style={{marginRight: 10}}>{icon}</View> : null}
      <TextInput
        {...rest}
        style={styles.input}
        placeholderTextColor={appColors.gray}
      />
      {trailing ? <View style={{marginLeft: 10}}>{trailing}</View> : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  scroll: {padding: 20, paddingBottom: 40, minHeight: '100%'},
  topBar: {flexDirection: 'row'},
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7fb',
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: appColors.white,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: appColors.charcoal,
    fontFamily: 'Lato_400Regular',
    paddingVertical: 12,
  },
  cta: {
    marginTop: 26,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#ed21f1',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  ctaDisabled: {
    backgroundColor: '#f7f7fb',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default NewPassword;
