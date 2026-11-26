import React, {memo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {router} from 'expo-router';
import {Trash2} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import {api} from '@/api/defineApi';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {useAuth} from '@/state/contexts/AuthContext';
import {useAppSelector} from '@/state/hooks';

// App Store guideline 5.1.1(v): an app that lets people create an account must
// let them delete it from inside the app. `Users.deleteUser` removes the
// account on the platform (not a deactivation), then the local session is
// cleared.
const DeleteAccountButton: React.FC = () => {
  const dict =
    useAppSelector(state => state.SystemContentReducer.content) ?? {};
  const {logOut} = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      const result = await api.Users.deleteUser();
      if (result !== true) {
        throw new Error(
          (result as {message?: string})?.message ||
            'The account was not deleted',
        );
      }
      await logOut();
      Toast.show({
        type: 'success',
        text1:
          (dict.account_deleted_text as string) ||
          'Your account has been deleted',
      });
      router.replace('/');
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Could not delete the account',
        text2: e?.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPress = () => {
    Alert.alert(
      (dict.confirmation_text as string) || 'Delete account?',
      (dict.delete_user_confirmation as string) ||
        'Your account and personal data will be permanently deleted. This cannot be undone.',
      [
        {text: (dict.cancel_text as string) || 'Cancel', style: 'cancel'},
        {
          text: (dict.delete_account_text as string) || 'Delete account',
          style: 'destructive',
          onPress: deleteAccount,
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.85}
      accessibilityRole={'button'}
      style={styles.button}>
      {isLoading ? (
        <ActivityIndicator size={'small'} color={appColors.red} />
      ) : (
        <Trash2 size={16} color={appColors.red} />
      )}
      <Paragraph size={14} weight={'700'} style={{color: appColors.red}}>
        {(dict.delete_account_text as string) || 'Delete account'}
      </Paragraph>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: appColors.white,
    borderWidth: 1,
    borderColor: appColors.slate150,
  },
});

export default memo(DeleteAccountButton);
