import { lazy } from 'react';
import { Login, } from '../pages';
import { AppLayoutNew } from '../layout/AppLayoutNew';
// const Login = lazy(() => import('../pages/Auth/Login/index'));
// const Register = lazy(() => import('../pages/Auth/Register/index'));
// const Otp = lazy(() => import('../pages/Auth/otp/index'));
// const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
// const OTP = lazy(() => import("../pages/Auth/VerifyOtp"));
// const DefaultLayout = lazy(() => import('../layout/AppLayoutNew.jsx'));
// const Error = lazy(() => import("../pages/MainPage/Error/Error"));

const earlyRoutes = [
  {
    title: 'Login',
    exact: true,
    path: '/',
    component: Login,
    guarded: false,
  },
  {
    title: 'Login',
    path: '/login',
    component: Login,
    guarded: false,
  },
  // {
  //   title: 'RequestOTP',
  //   path: '/request-otp',
  //   component: RequestOTP,
  //   guarded: false,
  // },
  // {
  //   title: 'VerifyOTP',
  //   path: '/verify-otp',
  //   component: VerifyOTP,
  //   guarded: false,
  // },
  // {
  //   title: 'Reset Password',
  //   path: '/reset-password',
  //   component: ResetPassword,
  //   guarded: false,
  // },
  // {
  //   title: 'Reset Password Sucess',
  //   path: '/reset-success',
  //   component: ResetPasswordSuccess,
  //   guarded: false,
  // },
  // {
  //   title: 'Register',
  //   path: '/register',
  //   component: Register,
  //   guarded: false,
  // },
  // {
  //   title: 'Verify OTP',
  //   path: '/verify-account',
  //   component: VerifyAccount,
  //   guarded: false,
  // },
  // {
  //   title: 'Create Business',
  //   path: '/create-business',
  //   component: CreateBusiness,
  //   guarded: false,
  // },
  // {
  //   title: 'Pricing',
  //   path: '/pricing/:id',
  //   component: Pricing,
  //   guarded: false,
  // },
  // {
  //   title: 'Create Business',
  //   path: '/receipt/:id',
  //   component: ReceiptPreview,
  //   guarded: false,
  // },

  // {
  //   path: "/verify-otp",
  //   component: OTP,
  //   guarded: false,
  // },
  // {
  //   path: "/error",
  //   component: Error,
  //   guarded: false,
  // },

  {
    path: '/app',
    component: AppLayoutNew,
    guarded: true,
  },
];

export { earlyRoutes };
