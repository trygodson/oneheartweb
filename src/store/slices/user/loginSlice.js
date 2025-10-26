import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { GET_STORAGE_ITEM, REMOVE_STORAGE_ITEM, SET_STORAGE_ITEM } from '../../../config/storage';

const initialState = {
  loading: false,
  error: null,
  token: GET_STORAGE_ITEM('token') || null,
  user: GET_STORAGE_ITEM('user') || null,
};

const loginSlice = createSlice({
  name: 'loginSlice',
  initialState,

  reducers: {
    logout: (state, action) => {
      REMOVE_STORAGE_ITEM('token');
      REMOVE_STORAGE_ITEM('refresh_token');
      REMOVE_STORAGE_ITEM('user');
      REMOVE_STORAGE_ITEM('phone');
      REMOVE_STORAGE_ITEM('account');
      window.location.href = '/login';
    },
  },

  extraReducers: (builder) => {
    builder.addCase(loginAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loginAction.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.loading = false;
    });
    builder.addCase(loginAction.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
  },
});

export const loginAction = createAsyncThunk('loginAction', async ({ data, navigate }, thunkApi) => {
  // thunkApi.dispatch(changeProgress(60));
  return null;
});

export default loginSlice.reducer;

export const { logout } = loginSlice.actions;
