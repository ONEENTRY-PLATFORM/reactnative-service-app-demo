import '../global.css';
import 'react-native-gesture-handler';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import 'react-native-reanimated';
import {Provider} from 'react-redux';
import {setupStore} from '@/state/store';
import {appColors} from '@/lib/constants/Colors';
import {
  useFonts,
  Lato_300Light,
  Lato_400Regular,
  Lato_700Bold,
} from '@expo-google-fonts/lato';
import {LeagueGothic_400Regular} from '@expo-google-fonts/league-gothic';
import {
  useGetAttributesByMarkerQuery,
  useGetChildPagesByUrlQuery,
  useGetMastersQuery,
} from '@/api';
import {useAppDispatch} from '@/state/hooks';
import {addCategoriesPages} from '@/state/reducers/CatalogCategoriesSlice';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import {addSalons} from '@/state/reducers/SalonsSlice';
import {addSystemContent} from '@/state/reducers/SystemContentSlice';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {addGallery} from '@/state/reducers/GallerySlice';
import {StatusBar} from 'expo-status-bar';
import {AuthProvider, useAuth} from '@/state/contexts/AuthContext';
import {HistoryProvider} from '@/state/contexts/HistoryProvider';
import Toast from 'react-native-toast-message';
import {brandedToastConfig} from '@/components/shared/BrandedToast';
import {storage} from '@/api/defineApi';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Branded replacement for expo-router's default red-box.
// See components/shared/AppErrorBoundary.tsx.
export {default as ErrorBoundary} from '@/components/shared/AppErrorBoundary';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const store = setupStore();
  const [fontsLoaded] = useFonts({
    Lato_300Light,
    Lato_400Regular,
    Lato_700Bold,
    LeagueGothic_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView>
        <KeyboardProvider>
          <HistoryProvider>
            <AuthProvider>
              <RootLayoutNav />
            </AuthProvider>
          </HistoryProvider>
          <Toast topOffset={120} config={brandedToastConfig} />
          <StatusBar />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}

function RootLayoutNav() {
  const {isUserInit} = useAuth();
  const {
    data: servicesData,
    isLoading: isLoadingServices,
    error: servicesError,
  } = useGetChildPagesByUrlQuery({
    url: 'services',
  });

  const {
    data: salonsData,
    isLoading: isLoadingSalons,
    error: salonsError,
  } = useGetChildPagesByUrlQuery({
    url: 'salons',
  });

  const {
    data: galleryData,
    isLoading: isLoadingGallery,
    error: galleryError,
  } = useGetChildPagesByUrlQuery({
    url: 'gallery',
  });

  // system_content is an attribute-set in this CMS (web loads it the same way).
  // Previous version fetched it as a block, which returned the wrong shape and
  // left the whole SystemContentReducer empty. See RN_ADAPTATION_PLAN.md § B.
  const {data: contentData, error: contentError} =
    useGetAttributesByMarkerQuery({setMarker: 'system_content'});

  const {
    data: mastersData,
    isLoading: isLoadingMasters,
    error: mastersError,
  } = useGetMastersQuery({});

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (mastersData && salonsData && servicesData && isUserInit) {
      SplashScreen.hideAsync();
    }
  }, [salonsData, servicesData, mastersData, isUserInit]);

  useEffect(() => {
    if (!isLoadingServices && servicesData) {
      dispatch(addCategoriesPages(servicesData));
    }
  }, [servicesData]);

  useEffect(() => {
    if (!isLoadingSalons && salonsData) {
      dispatch(addSalons(salonsData));
    }
  }, [salonsData]);

  useEffect(() => {
    if (contentData) {
      dispatch(addSystemContent(contentData as any));
    }
  }, [contentData]);

  useEffect(() => {
    if (galleryData) {
      dispatch(addGallery(galleryData));
    }
  }, [galleryData]);

  // Don't crash the whole app on missing CMS collections — the Stack and its
  // child routes can still render (SDK slots that came back empty just show
  // their EmptyState). Actual errors are dropped as warnings for later triage.
  const rootFetchError =
    servicesError || salonsError || contentError || galleryError;
  if (rootFetchError) {
    console.warn('[RootLayout] initial fetch failed:', rootFetchError);
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: appColors.white,
        },
      }}>
      <Stack.Screen name="(tabs)" options={{headerShown: false}} />
      <Stack.Screen name="auth" options={{headerShown: false}} />
      <Stack.Screen name="index" options={{headerShown: false}} />
    </Stack>
  );
}
