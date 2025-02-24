import React from 'react';
import MastersList from '@/components/content/MastersScreen/MastersList';
import {Screen} from '@/components/shared/Screen';
import SalonPicker from '@/components/shared/SalonPicker';
import SelectMastersButton from '@/components/content/MastersScreen/SelectMastersButton';
import {ScrollView} from 'react-native';

type Props = {};

const MastersScreen: React.FC<Props> = ({}) => {

  return (
    <Screen className={'mt-5'} edges={['horizontal']}>
      <ScrollView
        contentContainerStyle={{gap: 20}}
        showsVerticalScrollIndicator={false}>
        <SalonPicker />
        <SelectMastersButton />
        <MastersList />
      </ScrollView>
    </Screen>
  );
};

export default MastersScreen;

//   const mastersByServices = masters.reduce(
//     (servicesMasters: Record<string, IAdminEntity[]>, currentMaster) => {
//       const services = currentMaster?.attributeValues?.services?.value;
//
//       services.forEach((service: Record<any, any>) => {
//         const thisSalon = servicesMasters[service.title];
//         if (!thisSalon) {
//           servicesMasters[service.title] = [];
//         }
//
//         thisSalon?.push(currentMaster);
//       });
//
//       return servicesMasters;
//     },
//     {},
//   );
//
//   return Object.entries(mastersByServices).map(([key, value]) => ({
//     data: value,
//     title: key,
//   }));
// }
// return [];

// <Accordion
//   sections={mastersByServices}
//   containerStyle={{gap: 18}}
//   renderHeader={(content, index, isActive) => (
//     <CategoryAccordionButton
//       content={content}
//       index={index}
//       isActive={isActive}
//       setActiveSections={setActiveSections}
//     />
//   )}
//   renderContent={section => {
//     return (
//       <MastersList
//         role={section.title}
//         masters={section.data}
//       />
//     );
//   }}
//   onChange={indexes => {
//     setActiveSections(indexes);
//   }}
//   activeSections={activeSections}
// />
