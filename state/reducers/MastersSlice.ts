import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IAdminEntity} from 'oneentry/dist/admins/adminsInterfaces';
import {RootState} from '@/state/store';

type initialStateType = {
  masters: IAdminEntity[];
};

const initialState: initialStateType = {
  masters: [],
};

const MastersSlice = createSlice({
  name: 'masters',
  initialState,
  reducers: {
    addMasters(state, action: PayloadAction<IAdminEntity[]>) {
      state.masters = action.payload.filter(
        master => !!master?.attributeValues?.master_image,
      );
    },
  },
});

export const {addMasters} = MastersSlice.actions;
export default MastersSlice.reducer;

export const getMasterById = (state: RootState, id: number) => {
  return state.MastersReducer.masters.find((master) => master.id === id);
};
