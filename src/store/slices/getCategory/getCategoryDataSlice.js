import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  GetAuditorsService,
  GetDefectStatusService,
  GetInspectionTypesService,
  GetInspectorsService,
  GetTemplatesService,
  GetVesselsService,
} from './otherService';
// import {
//   GetAuditorsService,
//   GetInspectionTypesService,
//   GetInspectorsService,
//   GetTemplatesService,
//   GetVesselsService,
// } from '@/services/otherService';

const initialState = {
  loading: false,
  error: null,
  vessels: null,
  templates: null,
  inspection_types: null,
  inspectors: null,
  auditors: null,
  defect_status: null,
};
const getCategoryDataSlice = createSlice({
  name: 'category',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(getCategoryDataAction.pending, (state) => {
      {
        state.loading = true;
      }
    });
    builder.addCase(getCategoryDataAction.fulfilled, (state, action) => {
      state.templates = action.payload[0]?.data;
      state.vessels = action.payload[1]?.data;
      state.inspection_types = action.payload[2]?.data;
      state.inspectors = action.payload[3]?.data;
      state.auditors = action.payload[4]?.data;
      state.defect_status = action.payload[5]?.data;
      state.loading = false;
    });
    builder.addCase(getCategoryDataAction.rejected, (state, action) => {
      {
        state.error = action.payload;
        state.loading = false;
      }
    });
  },
});

export const getCategoryDataAction = createAsyncThunk('getCategoryDataAction', async (data, thunkApi) => {
  // thunkApi.dispatch(changeLoading(true));
  return Promise.all([
    GetTemplatesService(),
    GetVesselsService(),
    GetInspectionTypesService(),
    GetInspectorsService(),
    GetAuditorsService(),
    GetDefectStatusService(),
  ])
    .then(async (response) => {
      if (response[0]?.status === 'success' || response[0]?.success) {
        return response;
      } else {
        // thunkApi.dispatch(changeLoading(false));
        return thunkApi.rejectWithValue(response.message);
      }
    })
    .catch((error) => {
      // thunkApi.dispatch(changeLoading(false));
      return thunkApi.rejectWithValue(error);
    });
});

export default getCategoryDataSlice.reducer;

// export const {changeLoading, reset} = loginSlice.actions;
