import React, {Dispatch, memo} from 'react';
import {View} from 'react-native';
import {useAppSelector} from '@/state/hooks';
import CustomImage from '@/components/shared/CustomImage';

interface Props {
}

const ProfileContent: React.FC<Props> = ({}) => {
  const {round_logo} = useAppSelector(
    state => state.SystemContentReducer.content,
  );

  return (
    <View>
      <View className={'py-layout items-center'}>
        <CustomImage uri={round_logo} height={141} width={141} />
      </View>
      {/*<UpdateUserForm editing={editing} setEditing={setEditing} />*/}
    </View>
  );
};

export default memo(ProfileContent);
