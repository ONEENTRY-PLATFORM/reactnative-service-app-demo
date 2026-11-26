import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {router} from 'expo-router';
import {Eye, EyeOff, X} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {ISignUpData} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import {useSignUpMutation} from '@/api';
import {useAuth} from '@/state/contexts/AuthContext';
import {useAppSelector} from '@/state/hooks';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import SocialSignIn from '@/components/auth/SocialSignIn';

const POLICY_URL = process.env.EXPO_PUBLIC_POLICY_URL ?? '';

// Mobile sign-up mirrors the sign_in visual language: fuchsia-gradient header
// with close X, full-width underline fields, big pink CTA, "Already have an
// account? Sign in" link. Static fields (name / email / phone / password /
// confirm) — the CMS-driven variant lived in SignUpForm but crashed on this
// project because useFormConfig's returned fields shape changed.

const PINK = '#ed21f1';
const PINK2 = '#f60efb';

const SignUp: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dict = useAppSelector(state => state.SystemContentReducer.content) ?? {};
  const {signIn} = useAuth();
  const [signUp, {data: signUpData, isLoading, error}] = useSignUpMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errMsg, setErrMsg] = useState<string>('');

  const passwordsMatch = password.length > 0 && password === confirm;
  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    passwordsMatch;

  const onSignUp = async () => {
    if (!canSubmit) return;
    setErrMsg('');

    const data: ISignUpData = {
      formIdentifier: 'reg',
      authData: [
        {marker: 'email_reg', value: email.trim()},
        {marker: 'password_reg', value: password},
      ],
      formData: [
        {marker: 'name_reg', type: 'string', value: name.trim()},
        {marker: 'email_reg', type: 'string', value: email.trim()},
        {marker: 'password_reg', type: 'string', value: password},
        ...(phone.trim()
          ? [{marker: 'phone_reg', type: 'string', value: phone.trim()}]
          : []),
        {
          marker: 'email_notification_reg',
          type: 'string',
          value: email.trim(),
        },
      ],
      notificationData: {
        email: email.trim(),
        phonePush: [],
        phoneSMS: phone.trim(),
      },
    };

    try {
      await signUp({data}).unwrap();
    } catch (e: any) {
      setErrMsg(e?.message ?? 'Failed to create the account');
    }
  };

  // Handle the mutation's completion — either sign in (activated) or route
  // to the OTP screen for e-mail activation. Same logic as the old
  // SignUpForm; kept here because the wrapper is different.
  useEffect(() => {
    if (!signUpData) return;
    if (signUpData.isActive) {
      signIn({method: 'email', login: email.trim(), password});
      router.replace('/(tabs)/home');
    } else {
      router.navigate(
        `/auth/otp_screen?event=activate&identifier=${email.trim()}&method=email&password=${password}`,
      );
    }
  }, [signUpData]);

  useEffect(() => {
    if (error) {
      const msg =
        typeof error === 'string' ? error : (error as any)?.message ?? '';
      if (msg) setErrMsg(msg);
    }
  }, [error]);

  return (
    <View style={{flex: 1, backgroundColor: appColors.white}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom + 20,
          }}
          keyboardShouldPersistTaps={'handled'}
          showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={[PINK2, PINK]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[styles.header, {paddingTop: insets.top + 18}]}>
            <Paragraph size={26} weight={'700'} color={'white'}>
              {(dict.create_account_text as string) || 'Create Account'}
            </Paragraph>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.85}
              style={styles.closeBtn}>
              <X size={16} color={appColors.white} />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.body}>
            {/* All fields opt out of iOS Autofill/Strong-Password overlay —
                even the non-password ones. iOS treats the form as a sign-in
                form as soon as it sees a password field, and covers the
                other inputs with the yellow "Automatic Strong Password"
                banner. Setting `textContentType='none'` + `autoComplete='off'`
                on every field suppresses that. */}
            <UnderlineField
              label={(dict.name_label as string) || 'Name *'}
              value={name}
              onChangeText={setName}
              placeholder={'Jane Doe'}
              autoCapitalize={'words'}
              autoComplete={'off'}
              textContentType={'none'}
            />
            <UnderlineField
              label={(dict.email_label as string) || 'E-mail *'}
              value={email}
              onChangeText={setEmail}
              placeholder={'jane@doe.com'}
              keyboardType={'email-address'}
              autoCapitalize={'none'}
              autoComplete={'off'}
              textContentType={'none'}
            />
            <UnderlineField
              label={(dict.phone_label as string) || 'Phone'}
              value={phone}
              onChangeText={setPhone}
              placeholder={'+971 50 000 0000'}
              keyboardType={'phone-pad'}
              autoComplete={'off'}
              textContentType={'none'}
            />
            <UnderlineField
              label={(dict.password_label as string) || 'Password *'}
              value={password}
              onChangeText={setPassword}
              placeholder={'••••••••'}
              secureTextEntry={!showPass}
              autoCapitalize={'none'}
              // iOS suggests "Automatic Strong Password" for autoComplete=
              // 'password-new'/textContentType='newPassword', and its cover
              // overlays the field. `off` + `none` opts out.
              autoComplete={'off'}
              textContentType={'none'}
              passwordRules={''}
              trailing={
                <TouchableOpacity
                  onPress={() => setShowPass(v => !v)}
                  activeOpacity={0.7}
                  hitSlop={8}>
                  {showPass ? (
                    <EyeOff size={18} color={appColors.gray} />
                  ) : (
                    <Eye size={18} color={appColors.gray} />
                  )}
                </TouchableOpacity>
              }
            />
            <UnderlineField
              label={
                (dict.confirm_password_label as string) || 'Confirm password *'
              }
              value={confirm}
              onChangeText={setConfirm}
              placeholder={'••••••••'}
              secureTextEntry={!showPass}
              autoCapitalize={'none'}
              autoComplete={'off'}
              textContentType={'none'}
              passwordRules={''}
            />

            {confirm.length > 0 && !passwordsMatch ? (
              <Paragraph size={12} color={'red'}>
                Passwords don't match.
              </Paragraph>
            ) : null}
            {errMsg ? (
              <Paragraph size={12} color={'red'}>
                {errMsg}
              </Paragraph>
            ) : null}

            <TouchableOpacity
              onPress={onSignUp}
              disabled={!canSubmit || isLoading}
              activeOpacity={0.9}
              style={[
                styles.primary,
                (!canSubmit || isLoading) && styles.primaryDisabled,
              ]}>
              {canSubmit && !isLoading ? (
                <LinearGradient
                  colors={[PINK2, PINK]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              {isLoading ? (
                <ActivityIndicator size={'small'} color={appColors.white} />
              ) : (
                <Paragraph
                  size={14}
                  weight={'700'}
                  style={{
                    color: canSubmit ? appColors.white : appColors.gray,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}>
                  {(dict.sign_up_text as string) || 'Create account'}
                </Paragraph>
              )}
            </TouchableOpacity>

            {POLICY_URL ? (
              <Paragraph size={12} color={'gray'} style={{textAlign: 'center'}}>
                {'By creating an account you agree to our '}
                <Paragraph
                  size={12}
                  color={'primary'}
                  weight={'700'}
                  onPress={() => Linking.openURL(POLICY_URL)}
                  style={{textDecorationLine: 'underline'}}>
                  {(dict.privacy_policy_text as string) || 'Privacy policy'}
                </Paragraph>
              </Paragraph>
            ) : null}

            <SocialSignIn />

            <View style={styles.bottomRow}>
              <Paragraph size={13} color={'gray'}>
                {(dict.have_account_text as string) ||
                  'Already have an account?'}
              </Paragraph>
              <Pressable
                onPress={() => router.replace('/auth/sign_in')}
                hitSlop={8}>
                <Paragraph
                  size={13}
                  weight={'700'}
                  style={{color: PINK, marginLeft: 6}}>
                  {(dict.sign_in_text as string) || 'Sign in'}
                </Paragraph>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const UnderlineField: React.FC<
  React.ComponentProps<typeof TextInput> & {
    label: string;
    trailing?: React.ReactNode;
  }
> = ({label, trailing, ...rest}) => (
  <View style={{gap: 4}}>
    <Paragraph size={12} color={'gray'}>
      {label}
    </Paragraph>
    <View style={styles.fieldRow}>
      <TextInput
        {...rest}
        placeholderTextColor={appColors.gray}
        style={styles.input}
      />
      {trailing ? <View style={{marginLeft: 8}}>{trailing}</View> : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 28,
    backgroundColor: appColors.white,
    gap: 20,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: appColors.slate200,
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: appColors.charcoal,
    fontFamily: 'Lato_400Regular',
    paddingVertical: 8,
  },
  primary: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: PINK,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  primaryDisabled: {
    backgroundColor: '#f7f7fb',
    shadowOpacity: 0,
    elevation: 0,
  },
  bottomRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignUp;
