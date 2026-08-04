import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Redirect, router} from 'expo-router';
import {LogOut, Mail, Pencil, Phone as PhoneIcon, User} from 'lucide-react-native';
import type {IAuthFormData} from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import {useAuth} from '@/state/contexts/AuthContext';
import {useAppSelector} from '@/state/hooks';
import {useUpdateMeMutation} from '@/api';
import {Screen} from '@/components/shared/Screen';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {useHistoryContext} from '@/state/contexts/HistoryProvider';

// Mobile profile — mirrors the web ProfileCard layout: a white card with a
// Profile title + Sign-out button, gradient avatar with the user's name,
// read-only field rows for Name / E-mail / Phone with an Edit toggle that
// swaps them for inputs + Save / Cancel row.

const PINK = '#ed21f1';
const PINK2 = '#f60efb';

const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() ?? '').join('') || '?';
};

const readField = (user: any, marker: string): string => {
  const entry = user?.formData?.find((f: any) => f.marker === marker) as
    | {value?: string}
    | undefined;
  return String(entry?.value ?? '');
};

export default function ProfileScreen() {
  const {user, logOut, isUserInit} = useAuth();
  const {setLastVisitedTab} = useHistoryContext();
  const dict = useAppSelector(state => state.SystemContentReducer.content) ?? {};
  const [updateMe, {isLoading: saving}] = useUpdateMeMutation();

  useEffect(() => {
    if (!user) setLastVisitedTab('profile');
  }, [user, setLastVisitedTab]);

  const name = readField(user, 'name_reg');
  const phone = readField(user, 'phone_reg');
  const email = readField(user, 'email_reg') || (user as any)?.identifier || '';

  const [editing, setEditing] = useState(false);
  const [nameEdit, setNameEdit] = useState(name);
  const [phoneEdit, setPhoneEdit] = useState(phone);

  useEffect(() => {
    if (!editing) {
      setNameEdit(name);
      setPhoneEdit(phone);
    }
  }, [name, phone, editing]);

  const displayName = name || email || 'You';
  const initials = useMemo(() => initialsOf(displayName), [displayName]);

  // Wait for the session-restore check before deciding what to render — a
  // cold start hits this screen with `user` still `undefined` while the SDK
  // is refreshing the token from MMKV.
  if (!isUserInit) {
    return (
      <Screen isFull edges={['top', 'horizontal']}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size={'large'} color={PINK} />
        </View>
      </Screen>
    );
  }
  if (!user) {
    return <Redirect href={'/auth/sign_in'} />;
  }

  const onSave = async () => {
    const formData: IAuthFormData[] = [];
    if (nameEdit) {
      formData.push({marker: 'name_reg', value: nameEdit, type: 'string'});
    }
    if (phoneEdit) {
      formData.push({marker: 'phone_reg', value: phoneEdit, type: 'string'});
    }
    if (!user.formIdentifier) return;
    try {
      await updateMe({formIdentifier: user.formIdentifier, formData}).unwrap();
      setEditing(false);
    } catch {
      // Errors are already surfaced elsewhere; keep the form editable so the
      // user can retry.
    }
  };

  const onCancel = () => {
    setNameEdit(name);
    setPhoneEdit(phone);
    setEditing(false);
  };

  return (
    <Screen isFull edges={['horizontal']}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps={'handled'}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{padding: 16, paddingBottom: 120, gap: 16}}>
          {/* Profile card — matches the web ProfileCard */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Paragraph size={20} weight={'400'} color={'charcoal'}>
                {(dict.profile_title as string) || 'Profile'}
              </Paragraph>
              <TouchableOpacity
                onPress={() => {
                  logOut();
                  router.replace('/');
                }}
                activeOpacity={0.85}
                style={styles.signOutBtn}>
                <LogOut size={14} color={PINK} />
                <Paragraph
                  size={12}
                  weight={'700'}
                  style={{
                    color: PINK,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}>
                  {(dict.sign_out_text as string) || 'Sign out'}
                </Paragraph>
              </TouchableOpacity>
            </View>

            {/* Avatar + name row */}
            <View style={styles.avatarRow}>
              <LinearGradient
                colors={[PINK2, PINK]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.avatar}>
                <Paragraph size={18} weight={'700'} color={'white'}>
                  {initials}
                </Paragraph>
              </LinearGradient>
              <Paragraph size={16} weight={'700'} color={'charcoal'} numberOfLines={1}>
                {displayName}
              </Paragraph>
            </View>

            <View style={styles.divider} />

            {editing ? (
              <View style={{gap: 14}}>
                <InputRow
                  Icon={User}
                  label={(dict.name_label as string) || 'Name'}
                  value={nameEdit}
                  onChangeText={setNameEdit}
                  placeholder={'Your name'}
                  autoCapitalize={'words'}
                />
                <ReadRow
                  Icon={Mail}
                  label={(dict.email_label as string) || 'E-mail'}
                  value={email}
                />
                <InputRow
                  Icon={PhoneIcon}
                  label={(dict.phone_label as string) || 'Phone'}
                  value={phoneEdit}
                  onChangeText={setPhoneEdit}
                  placeholder={'+971 50 000 0000'}
                  keyboardType={'phone-pad'}
                />

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={onCancel}
                    activeOpacity={0.85}
                    style={styles.cancelBtn}>
                    <Paragraph
                      size={13}
                      weight={'700'}
                      color={'gray'}
                      style={{
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}>
                      {(dict.cancel_text as string) || 'Cancel'}
                    </Paragraph>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onSave}
                    activeOpacity={0.9}
                    disabled={saving}
                    style={styles.saveBtn}>
                    <LinearGradient
                      colors={[PINK2, PINK]}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={StyleSheet.absoluteFill}
                    />
                    {saving ? (
                      <ActivityIndicator size={'small'} color={appColors.white} />
                    ) : (
                      <Paragraph
                        size={13}
                        weight={'700'}
                        color={'white'}
                        style={{
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                        }}>
                        {(dict.save_button_text as string) || 'Save'}
                      </Paragraph>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{gap: 14}}>
                <ReadRow
                  Icon={User}
                  label={(dict.name_label as string) || 'Name'}
                  value={name || '—'}
                />
                <ReadRow
                  Icon={Mail}
                  label={(dict.email_label as string) || 'E-mail'}
                  value={email || '—'}
                />
                <ReadRow
                  Icon={PhoneIcon}
                  label={(dict.phone_label as string) || 'Phone'}
                  value={phone || '—'}
                />

                <TouchableOpacity
                  onPress={() => setEditing(true)}
                  activeOpacity={0.9}
                  style={styles.editBtn}>
                  <LinearGradient
                    colors={[PINK2, PINK]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={StyleSheet.absoluteFill}
                  />
                  <Pencil size={14} color={appColors.white} />
                  <Paragraph
                    size={13}
                    weight={'700'}
                    color={'white'}
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}>
                    {(dict.edit_text as string) || 'Edit'}
                  </Paragraph>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* History of visits shortcut — mobile-only quick access, same intent
              as the "History" tab of the web layout. */}
          <Pressable
            onPress={() => router.navigate('/(tabs)/visits_history')}
            style={styles.historyRow}>
            <Paragraph size={14} weight={'700'} color={'charcoal'}>
              {(dict.history_of_visits_text as string) || 'History of visits'}
            </Paragraph>
            <Paragraph size={12} color={'gray'}>
              →
            </Paragraph>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// ── Rows ──────────────────────────────────────────────────────────────────
const ReadRow: React.FC<{
  Icon: typeof User;
  label: string;
  value: string;
}> = ({Icon, label, value}) => (
  <View style={{gap: 4}}>
    <View style={styles.rowLabel}>
      <Icon size={13} color={appColors.gray} />
      <Paragraph
        size={11}
        weight={'700'}
        color={'gray'}
        style={{textTransform: 'uppercase', letterSpacing: 1}}>
        {label}
      </Paragraph>
    </View>
    <Paragraph size={15} weight={'700'} color={'charcoal'}>
      {value}
    </Paragraph>
  </View>
);

const InputRow: React.FC<
  React.ComponentProps<typeof TextInput> & {
    Icon: typeof User;
    label: string;
  }
> = ({Icon, label, ...rest}) => (
  <View style={{gap: 6}}>
    <View style={styles.rowLabel}>
      <Icon size={13} color={appColors.gray} />
      <Paragraph
        size={11}
        weight={'700'}
        color={'gray'}
        style={{textTransform: 'uppercase', letterSpacing: 1}}>
        {label}
      </Paragraph>
    </View>
    <TextInput
      {...rest}
      autoComplete={'off'}
      textContentType={'none'}
      placeholderTextColor={appColors.gray}
      style={styles.input}
    />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: appColors.white,
    borderRadius: 20,
    padding: 20,
    gap: 18,
    shadowColor: PINK,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
    borderWidth: 1,
    borderColor: appColors.slate150,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: PINK,
    backgroundColor: appColors.white,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: appColors.slate150,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: appColors.slate150,
    paddingBottom: 6,
    paddingTop: 2,
    fontSize: 15,
    color: appColors.charcoal,
    fontFamily: 'Lato_400Regular',
  },
  editBtn: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: PINK,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  actionsRow: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
  },
  saveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: PINK,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    backgroundColor: appColors.white,
    borderWidth: 1,
    borderColor: appColors.slate150,
  },
});
