import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// A tiny slice that carries the wizard prefill across the router boundary.
// Tab routes in expo-router preserve their state, so navigating to
// /(tabs)/booking with `params` does not always land them on the screen.
// The offer cards drop the ids here right before navigate(); the wizard
// picks them up on mount and clears the slice so the next visit is clean.

interface BookingPrefillState {
  productIds: number[];
  salonId: number | null;
  masterAdminId: number | null;
  // Bumped on every set — used inside the wizard to distinguish a fresh
  // prefill from a stale one (`productIds` alone may repeat).
  version: number;
}

const initial: BookingPrefillState = {
  productIds: [],
  salonId: null,
  masterAdminId: null,
  version: 0,
};

const BookingPrefillSlice = createSlice({
  name: 'bookingPrefill',
  initialState: initial,
  reducers: {
    setBookingPrefill(
      state,
      action: PayloadAction<{
        productIds?: number[];
        salonId?: number | null;
        masterAdminId?: number | null;
      }>,
    ) {
      state.productIds = action.payload.productIds ?? [];
      state.salonId = action.payload.salonId ?? null;
      state.masterAdminId = action.payload.masterAdminId ?? null;
      state.version += 1;
    },
    clearBookingPrefill(state) {
      state.productIds = [];
      state.salonId = null;
      state.masterAdminId = null;
    },
  },
});

export const {setBookingPrefill, clearBookingPrefill} =
  BookingPrefillSlice.actions;
export default BookingPrefillSlice.reducer;
