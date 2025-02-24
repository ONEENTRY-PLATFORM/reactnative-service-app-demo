import React, {useMemo} from 'react';
import {useLocalSearchParams} from 'expo-router';
import {Screen} from '@/components/shared/Screen';
import {useAppSelector} from '@/state/hooks';
import {getMasterById} from '@/state/reducers/MastersSlice';
import MasterPortfolioCard from '@/components/content/MasterScreen/MasterPortfolioCard';
import {Paragraph} from '@/components/shared/Paragraph';
import {ScrollView} from 'react-native';
import MasterSalonsList from '@/components/content/MasterScreen/MasterSalonsList';
import MasterPortfolio from '@/components/content/MasterScreen/MasterPortfolio';

type Props = {};

const MasterScreen: React.FC<Props> = ({}) => {
  const res = useLocalSearchParams();
  const master = useAppSelector(state =>
    // @ts-ignore
    getMasterById(state, parseInt(res?.master)),
  );

  const portfolioIds = useMemo(() => {
    // const role = res.role;
    const prePortfolio = master?.attributeValues?.master_portfolio?.value;

    if (!prePortfolio) {
      return [];
    }

    return prePortfolio.map((v: any) => v.id);

    // return [prePortfolio.find(v => v.title.includes('role')).id];
  }, [master]);

  return (
    <Screen edges={['horizontal']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{gap: 18}}>
        <MasterPortfolioCard
          role={res.role as string}
          id={master?.id}
          master={master?.attributeValues}
        />
        {master?.attributeValues?.master_description?.value[0]?.plainValue && (
          <Paragraph size={12} color={'gray'}>
            {master?.attributeValues?.master_description?.value[0]?.plainValue}
          </Paragraph>
        )}

        <MasterSalonsList
          salons={master?.attributeValues?.master_salon?.value}
        />
        {portfolioIds && <MasterPortfolio portfolio={portfolioIds} />}
      </ScrollView>
    </Screen>
  );
};

export default MasterScreen;
