import {StyleSheet, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import Rating from '@/components/shared/Rating';
import {appColors} from '@/lib/constants/Colors';

// Reviews on nextjs-beauty are mock data (no CMS block backing them). Same
// treatment here — a couple of hand-written testimonials, styled to match the
// design system. Real API-backed reviews are tracked in WEB_PARITY_PLAN.md
// § "Этап 5".
const REVIEWS = [
  {
    name: 'Emma Rodriguez',
    stars: 5,
    text: 'Absolutely loved the experience! The whole team is so welcoming.',
  },
  {
    name: 'Sophia Ali',
    stars: 5,
    text: 'Best hair color I have had in years. Nicolas has magic hands.',
  },
];

const ReviewsCarousel = () => (
  <View style={{gap: 12}}>
    {REVIEWS.map((r, i) => (
      <View key={i} style={styles.card}>
        <Rating rating={r.stars} starSize={14} />
        <Paragraph
          color={'ink'}
          size={14}
          style={{marginTop: 8, marginBottom: 12}}>
          “{r.text}”
        </Paragraph>
        <Paragraph color={'charcoal'} size={13} weight={'700'}>
          — {r.name}
        </Paragraph>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: appColors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: appColors.slate150,
  },
});

export default ReviewsCarousel;
