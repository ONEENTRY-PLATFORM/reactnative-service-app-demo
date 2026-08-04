import {Screen} from '@/components/shared/Screen';
import GalleryCatalog from '@/components/content/GalleryScreen/GalleryCatalog';
import {useNavigationState} from "expo-router/react-navigation";

export default function GalleryScreen() {
  return (
    <Screen className={'mt-5'} edges={['horizontal']} white>
      <GalleryCatalog />
    </Screen>
  );
}
