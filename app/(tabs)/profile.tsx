import {Screen} from '@/components/shared/Screen';
import {useAuth} from '@/state/contexts/AuthContext';
import ProfileContent from '@/components/content/ProfileScreen/ProfileContent';
import UpdateUserForm from '@/components/content/ProfileScreen/UpdateUserForm';
import {Redirect, useFocusEffect} from 'expo-router';
import {useHistoryContext} from '@/state/contexts/HistoryProvider';

export default function ProfileScreen() {
  const {user} = useAuth();
  const {setLastVisitedTab} = useHistoryContext();

  useFocusEffect(() => {
    setLastVisitedTab('profile');
  });

  if (!user) {
    return <Redirect href={'/auth'} />;
  }

  return (
    <Screen isFull edges={['top', 'horizontal']}>
      <ProfileContent />
      <UpdateUserForm />
    </Screen>
  );
}
