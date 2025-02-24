import React, {Dispatch} from 'react';
import ChevronUp from '@/assets/icons/ChevronUp.svg';
import ChevronDown from '@/assets/icons/ChevronDown.svg';
import CustomButton from '@/components/shared/CustomButton';
import {IAdminEntity} from 'oneentry/dist/admins/adminsInterfaces';

type Props = {
  content: {data: IAdminEntity[]; title: string};
  index: number;
  isActive: boolean;
  setActiveSections: any;
};

const CategoryAccordionButton: React.FC<Props> = ({
  content,
  index,
  isActive,
  setActiveSections,
}) => {
  return (
    <CustomButton
      paragraphProps={{
        weight: '400',
        color: 'dark',
      }}
      Logo={isActive ? <ChevronUp /> : <ChevronDown />}
      paragraphColor={'dark'}
      onPress={() =>
        setActiveSections((prevState: number[]) => {
          const isIncludes = prevState.includes(index);

          if (isIncludes) {
            const filteredArray = prevState.filter(el => el !== index);
            return filteredArray;
          }

          return [...prevState, index];
        })
      }
      style={{height: 42}}
      isInline
      title={content.title}
    />
  );
};

export default CategoryAccordionButton;
