import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GetUserProfileDataService, UpdateUserProfileService } from '../../../services/userService';

// Async thunk for fetching user profile data
export const fetchUserProfile = createAsyncThunk(
  'userProfile/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await GetUserProfileDataService({ userId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  },
);

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  'userProfile/updateUserProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await UpdateUserProfileService(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  },
);

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState: {
    profileData: null,
    loading: false,
    updating: false,
    error: null,
  },
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    clearProfileData: (state) => {
      state.profileData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile cases
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profileData = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profileData = { ...state.profileData, ...action.payload };
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileError, clearProfileData } = userProfileSlice.actions;
export default userProfileSlice.reducer;
