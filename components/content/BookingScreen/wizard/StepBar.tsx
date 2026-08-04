import {StyleSheet, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';

// Progress indicator across the top of the booking wizard.
// Mirrors the four numbered pills in nextjs-beauty booking-page/StepBar,
// but keeps things simple — no clickable step navigation on RN (mobile UX
// prefers explicit Back button; we'll add one in the wizard shell).

export type StepDefinition = {
  key: string;
  label: string;
};

type Props = {
  steps: StepDefinition[];
  currentIndex: number;
};

const StepBar = ({steps, currentIndex}: Props) => (
  <View style={styles.row}>
    {steps.map((step, i) => {
      const done = i < currentIndex;
      const active = i === currentIndex;
      const stateColor = active
        ? appColors.primary
        : done
          ? appColors.cyanAccent
          : appColors.slate200;
      return (
        <View key={step.key} style={styles.stepWrap}>
          <View style={[styles.dot, {backgroundColor: stateColor}]}>
            <Paragraph
              color={'white'}
              size={12}
              weight={'700'}
              style={{textAlign: 'center'}}>
              {i + 1}
            </Paragraph>
          </View>
          <Paragraph
            color={active ? 'charcoal' : 'ink'}
            size={11}
            weight={active ? '700' : '400'}
            style={{textAlign: 'center', marginTop: 4}}
            numberOfLines={1}>
            {step.label}
          </Paragraph>
          {i < steps.length - 1 ? (
            <View
              style={[
                styles.connector,
                {
                  backgroundColor: done ? appColors.cyanAccent : appColors.slate200,
                },
              ]}
            />
          ) : null}
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  stepWrap: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    position: 'absolute',
    top: 12,
    left: '65%',
    right: '-35%',
    height: 2,
    zIndex: -1,
  },
});

export default StepBar;
