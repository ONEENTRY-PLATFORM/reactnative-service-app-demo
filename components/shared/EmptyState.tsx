import {StyleSheet, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import CustomButton from '@/components/shared/CustomButton';
import GradientLine from '@/components/shared/GradientLine';
import {appColors} from '@/lib/constants/Colors';

// Placeholder for a screen/section whose data is unavailable. Preferred over
// throwing on `useXxxQuery.error` — the wizard-style flows in this app should
// stay reachable so the user can navigate away even when one endpoint is 404.
type Props = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

const EmptyState = ({
  title = 'Nothing to show',
  description = 'The CMS returned no data for this screen.',
  actionLabel,
  onAction,
  compact = false,
}: Props) => (
  <View style={[styles.wrap, compact && styles.wrapCompact]}>
    <Paragraph
      family={'league-gothic'}
      size={compact ? 22 : 28}
      color={'charcoal'}
      style={{textTransform: 'uppercase', textAlign: 'center'}}>
      {title}
    </Paragraph>
    <GradientLine style={{width: 40, marginVertical: 8, borderRadius: 2}} />
    <Paragraph
      size={13}
      color={'ink'}
      style={{textAlign: 'center', marginBottom: actionLabel ? 16 : 0}}>
      {description}
    </Paragraph>
    {actionLabel && onAction ? (
      <CustomButton isInline title={actionLabel} onPress={onAction} />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 220,
    backgroundColor: appColors.white,
    borderRadius: 16,
  },
  wrapCompact: {
    minHeight: 100,
    padding: 12,
  },
});

export default EmptyState;
