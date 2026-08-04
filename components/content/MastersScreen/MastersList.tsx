import React, {useMemo} from 'react';
import {FlatList} from 'react-native';
import MasterInMastersCard from '@/components/content/MastersScreen/MasterInMastersCard';
import {useAppSelector} from '@/state/hooks';
import {Paragraph} from '@/components/shared/Paragraph';

type Props = {};

const MastersList: React.FC<Props> = ({}) => {
  const service = useAppSelector(state => state.OrderReducer.service);
  const masters = useAppSelector(state => state.MastersReducer.masters);
  const salon = useAppSelector(state => state.OrderReducer.salon);
  const categories = useAppSelector(
    state => state.CatalogCategoriesReducer.categories,
  );
  const {master_not_text, select_salon_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );

  const {qualifiedMasters, services} = useMemo(() => {
    const services: number[] = [];
    let qualifiedMasters = masters.filter(master => {
      const isService = master?.attributeValues?.master_services?.value?.some(
        (value: Record<any, any>) => {
          const qualified = service?.localizeInfos?.title === value?.title;
          if (qualified) {
            services.push(value.parentId);
            return qualified;
          }
        },
      );

      if (isService) {
        return master?.attributeValues?.master_salon?.value.some(
          (value: Record<any, any>) => {
            const qualified = value.id === salon?.id;
            return qualified;
          },
        );
      }

      return isService;
    });

    return {qualifiedMasters, services};
  }, [masters, service, salon]);

  const renderParagraph = ({text}: {text: string}) => {
    return (
      <Paragraph
        className={'text-center'}
        color={'gray'}
        size={20}
        weight={'600'}>
        {text}
      </Paragraph>
    );
  };

  if (!salon) {
    return renderParagraph({text: select_salon_text || ''});
  }

  return (
    <FlatList
      data={qualifiedMasters}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{gap: 20}}
      className={'mt-4'}
      ListEmptyComponent={() => renderParagraph({text: master_not_text})}
      renderItem={({item, index}) => (
        <MasterInMastersCard
          role={
            categories.find(category => category.id === services[index])
              ?.localizeInfos?.title || ' '
          }
          master={item}
        />
      )}
    />
  );
};

export default MastersList;
