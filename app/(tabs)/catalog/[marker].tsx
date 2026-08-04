import React from 'react';
import {Screen} from '@/components/shared/Screen';
import ServiceSelectButton from '@/components/content/CatalogScreen/ServiceSelectButton';
import ServicesList from '@/components/content/CatalogScreen/ServicesList';

type Props = {};

const CatalogScreen: React.FC<Props> = ({}) => {
  return (
    <Screen isFull edges={['horizontal', 'top']}>
      <ServiceSelectButton />
      <ServicesList />
    </Screen>
  );
};

export default CatalogScreen;
