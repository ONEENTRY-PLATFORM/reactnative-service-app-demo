import {
  Home,
  Grid2x2,
  Tag,
  Image as ImageIcon,
  Users,
  Phone,
  LucideIcon,
} from 'lucide-react-native';
import {appColors} from '@/lib/constants/Colors';

// Web version (nextjs-beauty) has home/services/booking/masters/profile as
// bottom-menu items with bespoke SVGs. We map every real CMS 'main' menu
// entry (home/services/offers/gallery/masters/contacts) to a Lucide icon,
// so the tab bar renders proper glyphs instead of the RN default triangles
// when CMS menu items don't ship attributeValues.icon.
const ICON_BY_MARKER: Record<string, LucideIcon> = {
  home: Home,
  services: Grid2x2,
  offers: Tag,
  gallery: ImageIcon,
  masters: Users,
  contacts: Phone,
  // Aliases for tab routes we still register (masters folder registers as
  // 'masters', but web also called this section 'specialists' in some places).
  specialists: Users,
  booking: Tag,
};

type Props = {
  pageUrl: string;
  focused: boolean;
  size?: number;
};

const TabBarIcon = ({pageUrl, focused, size = 24}: Props) => {
  const Icon = ICON_BY_MARKER[pageUrl] ?? Home;
  return (
    <Icon
      size={size}
      color={focused ? appColors.primary : appColors.ink}
      strokeWidth={focused ? 2.2 : 1.7}
    />
  );
};

export default TabBarIcon;
