import React from 'react';
import {Screen} from '@/components/shared/Screen';
import SpecialistsCatalog from '@/components/content/SpecialistsScreen/SpecialistsCatalog';

// Specialists tab — mobile port of nextjs-beauty /masters. Filter (salon +
// category + search) plus a row list of specialists live inside the catalog
// component so the tab shell stays a thin wrapper.
export default function MastersScreen() {
  return (
    <Screen className={'mt-5'} edges={['horizontal']}>
      <SpecialistsCatalog />
    </Screen>
  );
}
