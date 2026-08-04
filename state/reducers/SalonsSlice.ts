import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';
import {RootState} from '@/state/store';

type initialStateType = {
  salons: IPagesEntity[];
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
  },
});

export const {addSalons} = SalonsSlice.actions;
export default SalonsSlice.reducer;

export const getSalonById = (state: RootState, id: number) => {
  return state.SalonsReducer.salons.find(salon => salon.id === id);
};
