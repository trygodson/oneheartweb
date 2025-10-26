import React from 'react';
import CustomInput from '../../components/CustomInput';
import { MdOutlineMarkEmailUnread } from 'react-icons/md';
import CustomButton from '../../components/Buttons/CustomButton';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthPagesLayout from '../../layout/AuthPagesLayout';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ValidationError from '../../components/Error/ValidationError';
import { useDispatch, useSelector } from 'react-redux';
// import { resetPasswordAction } from '../../store/slices/user/resetPasswordSlice';
import { FaCodepen } from 'react-icons/fa';
import { GET_STORAGE_ITEM } from '../../config/storage';
import '../../index.css';
import '../../styles/login.css';
import { FiArrowLeft } from 'react-icons/fi';
import { RestPasswordService } from '../../services/authServices';
import customToast from '../../components/Toast/toastify';
import { SlLock } from 'react-icons/sl';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object().shape({
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        )
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit(values) {
      const formData = new FormData();
      formData.append('otp', state?.otp);
      formData.append('email', state?.email);
      formData.append('password', values?.password);
      formData.append('password_confirmation', values?.confirmPassword);
      return RestPasswordService(formData)
        .then((res) => {
          if (res?.success) {
            customToast(res?.message ?? 'Password Reset Success');
            navigate('/reset-success');
          } else {
            customToast(res?.message ?? 'Error Resting', true);
          }
        })
        .catch((err) => {
          customToast(err?.message ?? 'Error Reseting Password', true);
        });
    },
  });

  const { handleSubmit, getFieldProps, errors, touched, isSubmitting } = formik;

  return (
    <AuthPagesLayout>
      <div className="flex flex-col min-h-screen justify-center items-center bg-white">
        {/* Minimal back arrow */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-14 left-12 text-gray-700 hover:text-gray-900"
          aria-label="Back"
        >
          <FiArrowLeft size={22} />
        </button>

        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col items-center">
          <h2 className="text-3xl  text-gray-900 mb-2 text-center">Reset Password?</h2>
          <p className="text-gray-500 text-base mb-6 text-center">Set a new password you can remember</p>
          <CustomInput
            label={'Password'}
            placeholder={'*********'}
            type={'password'}
            // Icon={() => <SlLock size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />}
            className="!bg-gray-100 !w-full !h-[50px] rounded-full  w-full"
            {...getFieldProps('password')}
          />
          {touched.password && errors.password && <ValidationError msg={errors.password} />}
          <CustomInput
            label={'Confirm Password'}
            placeholder={'*********'}
            type={'password'}
            containerClassName="mt-6"
            // Icon={<SlLock size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />}
            className="!bg-gray-100 !w-full !h-[50px] rounded-full w-full"
            {...getFieldProps('confirmPassword')}
          />
          {touched.confirmPassword && errors.confirmPassword && <ValidationError msg={errors.confirmPassword} />}
          <CustomButton
            type="submit"
            className="bg-[#052041] hover:bg-[#021024] mt-6 text-white rounded-full w-full py-4 text-base font-semibold mb-2"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Update Password
          </CustomButton>
        </form>

        {/* Back to Login */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <span className="text-gray-400 text-sm">
            Already Have An Account{' '}
            <Link to="/login" className="text-[#052041] font-medium hover:underline">
              Login
            </Link>
          </span>
        </div>
      </div>
    </AuthPagesLayout>
  );
};
