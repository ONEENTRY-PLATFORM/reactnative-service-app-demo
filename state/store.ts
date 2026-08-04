import {combineReducers, configureStore} from '@reduxjs/toolkit';
import CatalogCategoriesReducer from './reducers/CatalogCategoriesSlice';
import OrderReducer from './reducers/OrderSlice';
import SalonsReducer from './reducers/SalonsSlice';
import MastersReducer from './reducers/MastersSlice';
import SystemContentReducer from './reducers/SystemContentSlice';
import GalleryReducer from './reducers/GallerySlice';
import BookingPrefillReducer from './reducers/BookingPrefillSlice';
import {RTKApi} from '@/api';

const rootReducer = combineReducers({
  OrderReducer,
  CatalogCategoriesReducer,
  SalonsReducer,
  MastersReducer,
  SystemContentReducer,
  GalleryReducer,
  BookingPrefillReducer,
  [RTKApi.reducerPath]: RTKApi.reducer,
});

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(RTKApi.middleware),
  });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
