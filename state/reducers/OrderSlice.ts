import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IAdminEntity} from 'oneentry/dist/admins/adminsInterfaces';
import {IProductsEntity} from 'oneentry/dist/products/productsInterfaces';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';

type initialStateType = {
  order: [];
  master?: IAdminEntity;
  service?: IProductsEntity;
  salon?: IPagesEntity;
  time?: number;
  date?: number;
  method?: string;
  dateTimes?: any[];
};

const initialState: initialStateType = {
  order: [],
};

const OrderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    selectServiceForOrder(state, action: PayloadAction<IProductsEntity>) {
      state.time = undefined;
      state.date = undefined;
      state.method = undefined;
      state.service = action.payload;
    },
    deselectServiceForOrder(state) {
      state.service = undefined;
    },
    selectMasterForOrder(state, action: PayloadAction<IAdminEntity>) {
      state.master = action.payload;
    },
    deselectMasterForOrder(state) {
      state.master = undefined;
    },
    selectSalonForOrder(state, action: PayloadAction<IPagesEntity>) {
      state.salon = action.payload;
    },
    deselectSalonForOrder(state) {
      state.salon = undefined;
    },
    selectTimeForOrder(state, action: PayloadAction<number>) {
      state.time = action.payload;
    },
    deselectTimeForOrder(state) {
      state.time = undefined;
    },
    selectDateForOrder(
      state,
      action: PayloadAction<{date: number; times: any}>,
    ) {
      state.date = action.payload.date;
      state.dateTimes = action.payload.times;
    },
    deselectDateForOrder(state) {
      state.date = undefined;
      state.dateTimes = undefined;
    },
    selectPaymentMethodForOrder(state, action: PayloadAction<string>) {
      if (state.method === action.payload) {
        state.method = undefined;
      } else {
        state.method = action.payload;
      }
    },
    finishOrder(state) {
      state.master = undefined;
      state.salon = undefined;
      state.service = undefined;
      state.time = undefined;
      state.date = undefined;
      state.method = undefined;
    },
  },
});

export const {
  selectServiceForOrder,
  deselectServiceForOrder,
  selectMasterForOrder,
  deselectMasterForOrder,
  selectSalonForOrder,
  deselectSalonForOrder,
  selectTimeForOrder,
  deselectTimeForOrder,
  selectDateForOrder,
  deselectDateForOrder,
  selectPaymentMethodForOrder,
  finishOrder,
} = OrderSlice.actions;
export default OrderSlice.reducer;
