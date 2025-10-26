import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { GetNotificationsService, MarkAsReadNotificationsService } from '../../../services/userService';

const initialState = {
  loading: false,
  error: null,
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Get Notifications
    builder.addCase(getNotificationsAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getNotificationsAction.fulfilled, (state, action) => {
      state.notifications = action.payload || [];
      state.unreadCount = action.payload?.filter((n) => n.is_read === 0).length || 0;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(getNotificationsAction.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });

    // Mark as Read
    builder.addCase(markAsReadAction.pending, (state) => {
      // Don't show loading for mark as read
    });
    builder.addCase(markAsReadAction.fulfilled, (state, action) => {
      // Update the notification in the list
      const notificationId = action.meta.arg.notification_id;
      const index = state.notifications.findIndex((n) => n.id === notificationId);
      if (index !== -1) {
        state.notifications[index].is_read = 1;
        state.unreadCount = state.notifications.filter((n) => n.is_read === 0).length;
      }
    });
    builder.addCase(markAsReadAction.rejected, (state, action) => {
      state.error = action.payload;
    });
  },
});

export const getNotificationsAction = createAsyncThunk('getNotifications', async (userId, thunkApi) => {
  return GetNotificationsService({ userId })
    .then(async (response) => {
      if (response?.status === 'success' || response?.success) {
        return response.data;
      } else {
        return thunkApi.rejectWithValue(response.message);
      }
    })
    .catch((error) => {
      return thunkApi.rejectWithValue(error.message || 'Failed to fetch notifications');
    });
});

export const markAsReadAction = createAsyncThunk('markAsRead', async (payload, thunkApi) => {
  return MarkAsReadNotificationsService(payload)
    .then(async (response) => {
      if (response?.status === 'success' || response?.success) {
        return response.data;
      } else {
        return thunkApi.rejectWithValue(response.message);
      }
    })
    .catch((error) => {
      return thunkApi.rejectWithValue(error.message || 'Failed to mark notification as read');
    });
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
