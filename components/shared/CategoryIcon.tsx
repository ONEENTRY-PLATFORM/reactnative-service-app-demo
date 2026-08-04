import {SvgXml} from 'react-native-svg';
import {
  CATEGORY_SPRITE_INNER,
  CATEGORY_TILE_VIEWBOX,
} from '@/lib/categorySprite';

// Renders a single category icon by slicing the shared web sprite via viewBox
// — mirrors nextjs-beauty's CategoryTile trick (public/icons/ICONS_CATEGORY.svg
// + CATEGORY_TILES viewBox map). We strip the sprite's outer circle so it can
// float on top of our own fuchsia→cyan gradient.
type Props = {
  pageUrl: string;
  size?: number;
  color?: string;
};

const CategoryIcon = ({pageUrl, size = 36, color = '#ffffff'}: Props) => {
  const viewBox = CATEGORY_TILE_VIEWBOX[pageUrl];
  if (!viewBox) {
    return null;
  }
  // Force every path in the sprite to inherit the current fill/stroke, so the
  // same asset can be re-tinted (source has literal '#4C4D56'). Wrap in a
  // <g> that sets currentColor.
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor" color="${color}">${CATEGORY_SPRITE_INNER}</svg>`;
  return <SvgXml xml={xml} width={size} height={size} />;
};

export default CategoryIcon;
