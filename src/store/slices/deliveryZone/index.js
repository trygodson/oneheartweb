import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { GetDeliveryZoneService } from '../../../services/deliveryZoneService';

const initialState = {
  loading: false,
  error: null,
  response: null,
};
const deliveryZoneSlice = createSlice({
  name: 'deliveryZone',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(getDeliveryZoneAction.pending, (state) => {
      {
        state.loading = true;
      }
    });
    builder.addCase(getDeliveryZoneAction.fulfilled, (state, action) => {
      state.response = action.payload;
      state.loading = false;
    });
    builder.addCase(getDeliveryZoneAction.rejected, (state, action) => {
      {
        state.error = action.payload;
        state.loading = false;
      }
    });
  },
});

export const getDeliveryZoneAction = createAsyncThunk('getDeliveryZoneAction', async (data, thunkApi) => {
  return GetDeliveryZoneService({ status: 'active' })
    .then(async (response) => {
      if (response?.data?.success || response?.success) {
        // Return the array of delivery zones
        return response?.data?.data || response?.data || [];
      } else {
        return thunkApi.rejectWithValue(
          response?.data?.message || response?.message || 'Failed to fetch delivery zones',
        );
      }
    })
    .catch((error) => {
      return thunkApi.rejectWithValue(error);
    });
});

export default deliveryZoneSlice.reducer;

// export const {changeLoading, reset} = loginSlice.actions;
