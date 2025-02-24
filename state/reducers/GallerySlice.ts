import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IAdminEntity} from 'oneentry/dist/admins/adminsInterfaces';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';

type initialStateType = {
  gallery: IPagesEntity[];
};

const initialState: initialStateType = {
  gallery: [],
};

const GallerySlice = createSlice({
  name: 'masters',
  initialState,
  reducers: {
    addGallery(state, action: PayloadAction<IPagesEntity[]>) {
      state.gallery = action.payload;
    },
  },
});

export const {addGallery} = GallerySlice.actions;
export default GallerySlice.reducer;
