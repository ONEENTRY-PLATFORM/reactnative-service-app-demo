import {StyleProp, View, ViewStyle} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import GradientLine from '@/components/shared/GradientLine';

// Section header shared across list-like screens (home, offers, gallery).
// On the web this is the fuchsia block title with the gradient underline.
type Props = {
  title?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  style?: StyleProp<ViewStyle>;
};

const SectionTitle = ({title, subtitle, align = 'left', style}: Props) => {
  const isCentered = align === 'center';
  return (
    <View
      style={[
        {gap: 6, alignItems: isCentered ? 'center' : 'flex-start'},
        style,
      ]}>
      {title ? (
        <Paragraph
          family={'league-gothic'}
          size={32}
          weight={'400'}
          color={'charcoal'}
          style={{
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            textAlign: isCentered ? 'center' : 'left',
          }}>
          {title}
        </Paragraph>
      ) : null}
      {subtitle ? (
        <Paragraph
          size={14}
          color={'ink'}
          style={{textAlign: isCentered ? 'center' : 'left'}}>
          {subtitle}
        </Paragraph>
      ) : null}
      <GradientLine
        style={{width: isCentered ? 60 : 40, marginTop: 4, borderRadius: 2}}
      />
    </View>
  );
};

export default SectionTitle;
