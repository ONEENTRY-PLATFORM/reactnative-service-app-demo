import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IAdminEntity} from 'oneentry/dist/admins/adminsInterfaces';
import {RootState} from '@/state/store';
import {attrEntries} from '@/lib/oneentry/attributes';

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
        master =>
          !!master?.attributeValues?.master_image &&
          !!master?.attributeValues?.master_services,
      );
    },
  },
});

export const {addMasters} = MastersSlice.actions;
export default MastersSlice.reducer;

export const getMasterById = (state: RootState, id: number) => {
  return state.MastersReducer.masters.find(master => master.id === id);
};

export const isMastersInSalon = (state: RootState, id?: number): boolean => {
  return id
    ? state.MastersReducer.masters?.some(master =>
        attrEntries<any>(master.attributeValues?.master_salon).some(
          (salon: any) => id === salon.id,
        ),
      )
    : false;
};
