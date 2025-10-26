import React, { useState } from 'react';
import OtpInput from 'react-otp-input';
import { FiArrowLeft } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomButton from '../../components/Buttons/CustomButton';
import AuthPagesLayout from '../../layout/AuthPagesLayout';
import { SendRestOtpService, VerifyRestOtpService } from '../../services/authServices';
import customToast from '../../components/Toast/toastify';
import PageLoading, { LoadingIcon } from '../../components/Loaders/PageLoading';

export const VerifyOTP = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerifyCode = () => {
    if (otp.length === 6) {
      setLoading(true);
      // Handle OTP verification logic here
      // console.log('OTP:', otp);
      const formData = new FormData();
      formData.append('email', state?.email);
      formData.append('otp', otp);
      VerifyRestOtpService(formData)
        .then((res) => {
          if (res?.success) {
            customToast(res?.message ?? 'OTP confirmed');
            navigate('/reset-password', { state: { otp, email: state?.email } });
          } else {
            customToast(res?.message ?? 'OTP Error', true);
          }
        })
        .catch((err) => {
          customToast(err?.message ?? 'Error or Incorrect OTP', true);
        })
        .finally((d) => {
          setLoading(false);
        });
    }
  };

  const handleResentOtp = () => {
    const formData = new FormData();
    formData.append('email', state?.email);
    setResendLoading(true);
    SendRestOtpService(formData)
      .then((res) => {
        if (res?.success) {
          customToast(res?.message ?? 'OTP ReSent');
        } else {
          customToast(res?.message ?? 'OTP Error');
        }
      })
      .catch((err) => {
        customToast(err?.message ?? 'Error Sending OTP', true);
        console.log(err);
      })
      .finally((d) => {
        setResendLoading(false);
      });
  };

  return (
    <AuthPagesLayout>
      <div className="flex flex-col min-h-screen justify-center items-center bg-white px-6">
        {/* Back arrow */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-14 left-12 text-gray-700 hover:text-gray-900"
          aria-label="Back"
        >
          <FiArrowLeft size={22} />
        </button>

        <div className="w-full max-w-md flex flex-col items-center">
          {/* Title */}
          <h2 className="text-3xl font-semibold text-gray-900 mb-3 text-center">Verify Your Info</h2>

          {/* Subtitle */}
          <p className="text-gray-500 text-base mb-8 text-center">We've sent you a code to your mail.</p>

          {/* OTP Input */}
          {resendLoading ? (
            <div className=" w-full flex justify-center items-center" style={{ height: 400 }}>
              <LoadingIcon />
            </div>
          ) : (
            <>
              <div className="mb-12">
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  separator={<span className="mx-2"></span>}
                  inputStyle={{
                    width: '60px',
                    height: '60px',
                    margin: '0 4px',
                    fontSize: '18px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    border: '1.5px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    outline: 'none',
                    textAlign: 'center',
                  }}
                  focusStyle={{
                    border: '1.5px solid #052041',
                    boxShadow: '0 0 0 3px rgba(5, 32, 65, 0.1)',
                  }}
                  isInputNum={true}
                  shouldAutoFocus={true}
                  containerStyle="flex justify-center"
                  renderInput={(props) => <input {...props} />}
                />
              </div>

              <CustomButton
                onClick={handleVerifyCode}
                className="bg-[#052041] hover:bg-[#021024] text-white rounded-full w-full py-4 text-base font-semibold"
                disabled={loading || otp.length !== 6}
                loading={loading}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </CustomButton>
            </>
          )}

          {/* Verify Button */}
          {/* Resend Code Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-500 text-sm">
              Didn't receive the code?{' '}
              <button
                className="text-[#052041] font-medium hover:underline"
                onClick={() => {
                  handleResentOtp();
                }}
                disabled={resendLoading}
              >
                Resend
              </button>
            </span>
          </div>
        </div>
      </div>
    </AuthPagesLayout>
  );
};
