import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';
import {RootState} from '@/state/store';
import {IFilterParams} from 'oneentry/dist/products/productsInterfaces';

type initialStateType = {
  salons: IPagesEntity[];
  selectedSalon?: IPagesEntity;
  selectedSalonIndex?: number;
  selectedSalonFilter?: IFilterParams;
};

const initialState: initialStateType = {
  salons: [],
};

const SalonsSlice = createSlice({
  name: 'catalog-categories',
  initialState,
  reducers: {
    addSalons: (state, action: PayloadAction<IPagesEntity[]>) => {
      state.salons = action.payload;
    },
    selectSalon: (state, action: PayloadAction<number>) => {
      const salon = state.salons[action.payload];

      if (salon) {
        state.selectedSalon = salon;
        state.selectedSalonIndex = action.payload;
        state.selectedSalonFilter = {
          attributeMarker: 'salons',
          conditionMarker: 'in',
          conditionValue: salon.id,
        };
      }
    },
  },
});

export const {addSalons, selectSalon} = SalonsSlice.actions;
export default SalonsSlice.reducer;

export const getSalonById = (state: RootState, id: number) => {
  return state.SalonsReducer.salons.find((salon) => salon.id === id);
};
