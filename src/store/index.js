import { configureStore } from '@reduxjs/toolkit';
import loginSlice from './slices/user/loginSlice';
import deliveryZoneSlice from './slices/deliveryZone';

const store = configureStore({
  reducer: {
    authenticate: loginSlice,
    deliveryZone: deliveryZoneSlice,
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
