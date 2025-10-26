import React, { useState } from 'react';
import '../../index.css';
import '../../styles/login.css';

import CustomInput from '../../components/CustomInput';
import { MdOutlineMarkEmailUnread } from 'react-icons/md';
import CustomButton from '../../components/Buttons/CustomButton';
import { Link, useNavigate } from 'react-router-dom';
import AuthPagesLayout from '../../layout/AuthPagesLayout';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ValidationError from '../../components/Error/ValidationError';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft } from 'react-icons/fi';
import { SendRestOtpService } from '../../services/authServices';
import customToast from '../../components/Toast/toastify';
// import { getOTPAction } from '../../store/slices/user/getOTPSlice';

export const RequestOTP = () => {
  // const { loading } = useSelector((state) => state.get_otp);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().email('Invalid email address').required('email is required'),
    }),
    onSubmit(values) {
      const formData = new FormData();
      formData.append('email', values.email);
      return SendRestOtpService(formData)
        .then((res) => {
          if (res?.success) {
            customToast(res?.message ?? 'OTP Sent');
            navigate('/verify-otp', { state: { email: values.email } });
          } else {
            customToast(res?.message ?? 'OTP Error', true);
          }

          return;
        })
        .catch((err) => {
          customToast(err?.message ?? 'Error Sending OTP', true);
          console.log(err);
        });
      // dispatch(getOTPAction({ data: values, navigate }));
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
          <h2 className="text-3xl  text-gray-900 mb-2 text-center">Forgot Password?</h2>
          <p className="text-gray-500 text-base mb-6 text-center">Enter your registered email </p>
          <CustomInput
            className="!bg-gray-100 !w-full !h-[50px] rounded-full  w-full"
            placeholder="email@email.com"
            {...getFieldProps('email')}
          />
          {touched.email && errors.email && <ValidationError msg={errors.email} />}
          <CustomButton
            type="submit"
            className="bg-[#052041] hover:bg-[#021024] mt-6 text-white rounded-full w-full py-4 text-base font-semibold mb-2"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Send Code
          </CustomButton>
        </form>

        {/* Back to Login */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <span className="text-gray-400 text-sm">
            Back to{' '}
            <Link to="/login" className="text-[#052041] font-medium hover:underline">
              Login
            </Link>
          </span>
        </div>
      </div>
    </AuthPagesLayout>
  );
};
