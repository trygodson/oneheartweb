import { configureStore } from '@reduxjs/toolkit';
import loginSlice from './slices/user/loginSlice';

const store = configureStore({
  reducer: {
    authenticate: loginSlice,
    // getCategoryData: getCategoryDataSlice,
    // notifications: notificationSlice,
    // userProfile: userProfileSlice,

    // signup: signupSlice,
    // confirm_account: confirmAccountSlice,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware();
  },
});

export default store;
