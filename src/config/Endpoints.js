// export const BASE_URL = 'https://4fc7-197-210-53-66.ngrok-free.app';
// export const BASE_URL = "http://51.20.42.165:3001";
export const BASE_URL = 'http://localhost:3011';
// export const BASE_URL = 'https://naviscore.smitiv.co/api';
// export const UPLOAD_ASSET_URL = 'http://localhost:3002';

export const ApiEndPoints = {
  //AUTH
  LOGIN: '/admin/login',
  SEND_RESET_OTP: '/send/reset/otp',
  VERIFY_RESET_OTP: '/auth/verif_otp',
  RESET_PASSWORD: '/reset/password',
  NOTIFICATIONS: '/notifications',
  USER_PROFILE: '/settings/profile',
  SUBMIT_USER_PROFILE: '/settings/submit',
  NOTIFICATIONS_MARK_AS_READ: '/notifications/mark_as_read',

  KYC_LIST: '/admin/kyc',
  KYC_STATS: '/admin/kyc/statistics',
};
