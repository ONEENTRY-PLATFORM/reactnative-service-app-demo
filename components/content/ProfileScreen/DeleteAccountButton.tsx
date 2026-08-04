import React, {memo, useState} from 'react';
import CustomButton from '@/components/shared/CustomButton';
import {useAppSelector} from '@/state/hooks';
import {api} from '@/api/defineApi';
import {useAuth} from '@/state/contexts/AuthContext';
import {Alert} from 'react-native';
import Toast from 'react-native-toast-message';

type Props = {};

const DeleteAccountButton: React.FC<Props> = ({}) => {
  const {
    delete_account_text,
    cancel_text,
    select_text,
    delete_user_confirmation,
    confirmation_text,
  } = useAppSelector(state => state.SystemContentReducer.content);
  const {logOut} = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const onDeleteUser = async () => {
    try {
      Alert.alert(
        confirmation_text,
        delete_user_confirmation,
        [
          {
            text: cancel_text,
            style: 'cancel',
            onPress: () => console.log('Cancel Pressed'),
          },
          {
            text: select_text, // Yes button
            onPress: async () => {
              // Call the API to delete the user
              try {
                setIsLoading(true);
                const result = await api.Users.deleteUser();
                console.log(result);

                if (result) {
                  logOut(); // Log out the user if deletion is successful
                } else {
                  Toast.show({
                    type: 'error',
                    text1: 'Error',
                  });
                }
              } catch (err) {
                console.log(err);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
        {cancelable: false}, // Prevent accidental dismissal
      );
    } catch (e) {
      console.warn('Error deleting user:', e);
      Alert.alert('Error', 'An unexpected error occurred'); // Handle unexpected errors
    }
  };

  return (
    <CustomButton isLoading={isLoading} color={'red'} onPress={onDeleteUser}>
      {delete_account_text}
    </CustomButton>
  );
};

export default memo(DeleteAccountButton);
