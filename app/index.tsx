import React from 'react';
import {Redirect} from 'expo-router';

type Props = {

}

const Index: React.FC<Props> = ({}) => {
  return <Redirect href={'/(tabs)/home'} />;
};

export default Index;
