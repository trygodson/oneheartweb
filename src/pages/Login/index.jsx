import React, { useContext } from 'react';
import '../../index.css';
import '../../styles/login.css';
import { ImGoogle } from 'react-icons/im';
import CustomInput from '../../components/CustomInput';
import { SlLock } from 'react-icons/sl';
import { MdOutlineMarkEmailUnread } from 'react-icons/md';
import CustomButton from '../../components/Buttons/CustomButton';
import { Link, Navigate, useMatch, useNavigate } from 'react-router-dom';
import AuthPagesLayout from '../../layout/AuthPagesLayout';
import logo from '../../assets/images/logo.png';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ValidationError from '../../components/Error/ValidationError';
import { useAuthContext } from '../../context/authContext';
import { GoogleLogin } from '@react-oauth/google';
import { SET_STORAGE_ITEM } from '../../config/storage';
import { LoginService } from '../../services/authServices';
import customToast from '../../components/Toast/toastify';
import { setAuthorizationHeader } from '../../config/api';
import { useNotification } from '../../context/notificationContext';

export const Login = () => {
  // const { loading } = useSelector((state) => state.authenticate);
  const navigate = useNavigate();
  const { setLogin, setUserData } = useAuthContext();
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit(values) {
      const formData = new FormData();
      formData.append('email', values.email);
      formData.append('password', values.password);
      // fcmToken && formData.append('device_token', fcmToken);
      return LoginService(formData)
        .then((res) => {
          // console.log(res, '====login response===');
          if (res?.success) {
            // SET_STORAGE_ITEM('token', res.accessToken);
            SET_STORAGE_ITEM('token', res?.data?.accessToken);
            setAuthorizationHeader(res?.data?.accessToken);
            setLogin(res?.data);
            // delete res.data.access_token;
            SET_STORAGE_ITEM('user', res.data);
            setUserData(res.data);
            customToast(res?.message ?? 'Login Successfull');
            navigate('/app/home', {
              state: {},
            });
          } else {
            customToast(res?.message ?? 'Error Login IN', true);
          }
          // return;
        })
        .catch((err) => {
          customToast(err?.message, true);

          // return;
        });
    },
  });

  const { handleSubmit, getFieldProps, errors, touched, isSubmitting, isValid } = formik;

  // if (GET_STORAGE_ITEM('token') && GET_STORAGE_ITEM('user').isPhoneConfirmed) {
  //   console.log('first');
  //   return <Navigate to={'/home'} />;
  // }

  return (
    <AuthPagesLayout>
      <div className="flex flex-col min-h-screen justify-center items-center">
        <div className="flex justify-center items-center mb-7">
          <span className="text-lg font-bold text-primary">
            <img src={logo} alt="logo" className="w-40" />
          </span>
        </div>
        <p className="text-center font-bold text-xl text-[#41010b] mb-3">Welcome Back!</p>
        <p className="text-center text-black text-[13px] opacity-80">Please provide your login to proceed.</p>
        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col items-center">
          <div className="email !w-full">
            <CustomInput
              className={'!bg-[#e9e9eb]  !w-full !h-[50px] rounded-3xl'}
              placeholder={'Enter Email'}
              Icon={
                <MdOutlineMarkEmailUnread
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                />
              }
              {...getFieldProps('email')}
            />
            {touched.email && touched.email && <ValidationError msg={errors.email} />}
          </div>
          <div className="email mt-5 !w-full">
            <CustomInput
              placeholder={'Enter Password'}
              className={'!bg-[#e9e9eb]  !w-full !h-[50px] rounded-3xl'}
              type={'password'}
              // Icon={
              //   <SlLock
              //     size={17}
              //     color={'black'}
              //     className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              //   />
              // }
              {...getFieldProps('password')}
            />
            {touched.password && touched.password && <ValidationError msg={errors.password} />}
          </div>
          <div className="flex items-center mt-2 !w-full justify-between flex-row-reverse">
            <div onClick={() => navigate('/request-otp')} className="forgot-password cursor-pointer text-sm">
              Forgot Password?
            </div>
            {/* <div className="flex items-center gap-1">
              <input name="remember" id="remember" type={'checkbox'} className="accent-primary" />
              <label htmlFor="remember">Remember Me</label>
            </div> */}
          </div>
          <div className="form-footer !w-full">
            <CustomButton
              type={'submit'}
              className={'bg-[#41010b] !w-full !py-3 rounded-3xl '}
              disabled={isSubmitting || !isValid}
              loading={isSubmitting}

              // clickHandler={() => navigate("/home")}
            >
              <span className="text-white">{isSubmitting ? 'Please wait...' : ' Login'}</span>
            </CustomButton>
            {/* <button
              type="button"
              className="shadow flex gap-2 w-full bg-white py-4 mt-3 justify-center items-center rounded"
            >
              <ImGoogle />
              Sign in With Google
            </button> */}

            {/* <GoogleLogin
              onSuccess={(credentialResponse) => {
                // credentialResponse.credential is the JWT token
                // Send this token to your backend for verification or decode it on frontend
                console.log(credentialResponse);
              }}
              onError={() => {
                console.log('Login Failed');
              }}
            /> */}
          </div>
        </form>
        {/* <p className="no-account whitespace-nowrap mb-1">
          Don't have an account ?{' '}
          <span>
            {' '}
            <Link to={'/register'} className="font-medium">
              Sign Up
            </Link>{' '}
          </span>
        </p> */}
      </div>
    </AuthPagesLayout>
  );
};
