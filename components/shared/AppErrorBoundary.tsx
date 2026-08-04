import {ScrollView, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import CustomButton from '@/components/shared/CustomButton';
import GradientLine from '@/components/shared/GradientLine';
import {Screen} from '@/components/shared/Screen';
import {appColors} from '@/lib/constants/Colors';

// Branded replacement for the default expo-router red-box. Expo Router accepts
// a named `ErrorBoundary` export from app/_layout.tsx and renders it whenever
// something inside the route tree throws. Keep the surface intentionally
// small: title + technical message (collapsible) + a single Retry action.
type Props = {
  error: Error;
  retry: () => Promise<void>;
};

const AppErrorBoundary = ({error, retry}: Props) => (
  <Screen edges={['top', 'horizontal', 'bottom']} isFull>
    <View style={{alignItems: 'center', paddingHorizontal: 12, marginTop: 40}}>
      <Paragraph
        family={'league-gothic'}
        size={34}
        color={'charcoal'}
        style={{textTransform: 'uppercase', textAlign: 'center'}}>
        Something went wrong
      </Paragraph>
      <GradientLine style={{width: 60, marginTop: 6, borderRadius: 2}} />
      <Paragraph
        size={14}
        color={'ink'}
        style={{textAlign: 'center', marginTop: 16}}>
        The screen failed to render. Try again — if the problem persists, the
        CMS may be missing data this screen depends on.
      </Paragraph>
    </View>

    <ScrollView
      style={{
        marginHorizontal: 12,
        marginVertical: 20,
        maxHeight: 220,
        borderRadius: 10,
        backgroundColor: appColors.slate150,
        padding: 12,
      }}>
      <Paragraph size={12} color={'ink'} style={{fontFamily: 'Courier'}}>
        {error?.message ?? String(error)}
      </Paragraph>
    </ScrollView>

    <View style={{paddingHorizontal: 24, marginTop: 12}}>
      <CustomButton title={'Try again'} onPress={() => void retry()} />
    </View>
  </Screen>
);

export default AppErrorBoundary;
