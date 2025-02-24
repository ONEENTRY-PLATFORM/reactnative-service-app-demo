import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';
import {RootState} from '@/state/store';

type initialStateType = {
  categories: IPagesEntity[];
};

const initialState: initialStateType = {
  categories: [],
};

const CatalogCategoriesSlice = createSlice({
  name: 'catalog-categories',
  initialState,
  reducers: {
    addCategoriesPages: (state, action: PayloadAction<IPagesEntity[]>) => {
      state.categories = action.payload;
    },
  },
});

export const {addCategoriesPages} = CatalogCategoriesSlice.actions;
export default CatalogCategoriesSlice.reducer;

export const getCatalogCategories = (state: RootState) => {
  return state.CatalogCategoriesReducer.categories;
};
