import '../global.css';
import 'react-native-gesture-handler';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import 'react-native-reanimated';
import {Provider} from 'react-redux';
import {setupStore} from '@/state/store';
import {appColors} from '@/constants/Colors';
import {
  useGetBlockByMarkerQuery,
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
import {AuthProvider} from '@/state/contexts/AuthContext';
import {HistoryProvider} from '@/state/contexts/HistoryProvider';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const store = setupStore();

  return (
    <Provider store={store}>
      <GestureHandlerRootView>
        <KeyboardProvider>
          <HistoryProvider>
            <AuthProvider>
              <RootLayoutNav />
            </AuthProvider>
          </HistoryProvider>
          <StatusBar backgroundColor={appColors.primary} />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}

function RootLayoutNav() {
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

  const {data: contentData, error: contentError} = useGetBlockByMarkerQuery({
    marker: 'system_content',
  });

  const {
    data: mastersData,
    isLoading: isLoadingMasters,
    error: mastersError,
  } = useGetMastersQuery({}, {pollingInterval: 10000});

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (mastersData && salonsData && servicesData) {
      SplashScreen.hideAsync();
    }
  }, [mastersData, salonsData, servicesData]);

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
      dispatch(addSystemContent(contentData?.attributeValues));
    }
  }, [contentData]);

  useEffect(() => {
    if (galleryData) {
      dispatch(addGallery(galleryData));
    }
  }, [galleryData]);

  if (
    servicesError ||
    salonsError ||
    mastersError ||
    contentError ||
    galleryError
  )
    throw servicesError || salonsError;

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
