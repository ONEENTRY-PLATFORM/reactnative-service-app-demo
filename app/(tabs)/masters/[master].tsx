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
import {attrEntries} from '@/lib/oneentry/attributes';

type Props = {};

const MasterScreen: React.FC<Props> = ({}) => {
  const params = useLocalSearchParams();
  const master = useAppSelector(state =>
    // @ts-ignore
    getMasterById(state, parseInt(params?.master)),
  );

  const portfolioIds = useMemo(() => {
    // const role = res.role;
    const prePortfolio = attrEntries<any>(
      master?.attributeValues?.master_portfolio,
    );

    return prePortfolio.map((v: any) => v.id);

    // return [prePortfolio.find(v => v.title.includes('role')).id];
  }, [master]);

  return (
    <Screen edges={['horizontal']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{gap: 18}}>
        <MasterPortfolioCard
          role={params.role as string}
          id={master?.id}
          master={master}
        />
        {(() => {
          // CMS rich-text attribute exposes both plainValue and htmlValue. Some
          // records carry only the HTML variant, so fall back to it (tags
          // stripped) — mirrors nextjs-beauty's MasterDescription.
          const descEntry: any = attrEntries<any>(
            master?.attributeValues?.master_description,
          )[0];
          const text =
            (descEntry?.plainValue as string | undefined) ||
            (typeof descEntry?.htmlValue === 'string'
              ? descEntry.htmlValue
                  .replace(/<br\s*\/?>/gi, '\n')
                  .replace(/<[^>]+>/g, '')
                  .replace(/&nbsp;/g, ' ')
                  .trim()
              : '');
          return text ? (
            <Paragraph size={13} color={'ink'} style={{lineHeight: 20}}>
              {text}
            </Paragraph>
          ) : null;
        })()}

        <MasterSalonsList
          salons={attrEntries<any>(master?.attributeValues?.master_salon)}
        />
        {portfolioIds && <MasterPortfolio portfolio={portfolioIds} />}
      </ScrollView>
    </Screen>
  );
};

export default MasterScreen;
