import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {router} from 'expo-router';
import {ChevronLeft, Mail} from 'lucide-react-native';
import {useGenerateOTPMutation} from '@/api';
import {Screen} from '@/components/shared/Screen';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {useAppSelector} from '@/state/hooks';

// Forgot-password step 1 — same layout language as sign_in. Sends OTP to the
// e-mail, then navigates to the OTP screen for the code.

const Reset: React.FC = () => {
  const dict = useAppSelector(state => state.SystemContentReducer.content) ?? {};
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [generateOTP, {error, data}] = useGenerateOTPMutation();

  useEffect(() => {
    if (error) {
      Alert.alert(error.toString());
      if ((error as string)?.includes('has a code')) {
        router.navigate(`/auth/otp_screen?identifier=${email}&event=reset`);
      }
    }
  }, [error, email]);

  useEffect(() => {
    if (data) {
      router.navigate(`/auth/otp_screen?identifier=${email}&event=reset`);
    }
  }, [data, email]);

  const canSubmit = email.trim().length > 0;

  const onSend = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await generateOTP({
        marker: 'email',
        identifier: email.trim(),
        event: 'generate_otp',
      });
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
              {(dict.forgot_password_text as string) || 'Forgot password?'}
            </Paragraph>
            <Paragraph size={14} color={'gray'} style={{lineHeight: 20}}>
              {(dict.reset_pass_description as string) ||
                'Enter the e-mail linked to your account. We will send you a code to reset the password.'}
            </Paragraph>
          </View>

          <View style={{gap: 14, marginTop: 30}}>
            <View style={{gap: 6}}>
              <Paragraph
                size={11}
                weight={'700'}
                color={'gray'}
                style={{textTransform: 'uppercase', letterSpacing: 1.2}}>
                Email
              </Paragraph>
              <View style={styles.fieldBox}>
                <View style={{marginRight: 10}}>
                  <Mail size={18} color={appColors.gray} />
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={'you@example.com'}
                  keyboardType={'email-address'}
                  autoCapitalize={'none'}
                  autoComplete={'email'}
                  placeholderTextColor={appColors.gray}
                  style={styles.input}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={onSend}
            disabled={!canSubmit || loading}
            activeOpacity={0.9}
            style={[
              styles.cta,
              (!canSubmit || loading) && styles.ctaDisabled,
            ]}>
            {!canSubmit || loading ? null : (
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
                  color: canSubmit ? appColors.white : appColors.gray,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}>
                {(dict.send_text as string) || 'Send'}
              </Paragraph>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

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

export default Reset;
