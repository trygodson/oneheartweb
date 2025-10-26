import React, { useState } from 'react';
import AuthPagesLayout from '../../layout/AuthPagesLayout';
import { Link, useNavigate } from 'react-router-dom';
import OTPInput from '../../components/CustomInput/OTPInput';
import CustomButton from '../../components/Buttons/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import { GET_STORAGE_ITEM } from '../../config/storage';
// import { confirmAccountAction } from '../../store/slices/user/confirmAccountSlice';

export const VerifyAccount = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [otp, setOtp] = useState();
  const { loading: otpLoading } = useSelector((state) => state.confirm_account);

  const verifyOTP = () => {
    const data = {
      phone: GET_STORAGE_ITEM('phone') || GET_STORAGE_ITEM('user')?.phone,
      code: otp,
      deviceId: 'test_id',
    };

    // dispatch(confirmAccountAction({ data, navigate }));
  };

  return (
    <AuthPagesLayout>
      <div className="max-w-[500px] w-full mt-28 my-16 flex flex-col self-start px-5">
        <div className="text-center">
          <p className="font-semibold text-3xl">Verify OTP</p>
          <p className="text-sm text-secondary-brown">
            Account already activated?{' '}
            <Link to={'/login'} className="text-primary font-medium">
              Login
            </Link>
          </p>
        </div>
        <div className="flex flex-col items-center w-full mt-16 otp">
          <p className="mb-8 mx-auto max-w-sm text-center">
            Please enter The OTP sent to your registered email or phone number to move to the next step.
          </p>
          <OTPInput {...{ otp, setOtp }} />{' '}
          <div className=" mt-12 flex">
            <CustomButton
              clickHandler={verifyOTP}
              className={'w-fit'}
              children={'Confirm and Next'}
              disabled={otpLoading}
              loading={otpLoading}
            />
          </div>
        </div>
      </div>
    </AuthPagesLayout>
  );
};
