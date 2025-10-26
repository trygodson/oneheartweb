import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../../components/Buttons/CustomButton';
import AuthPagesLayout from '../../layout/AuthPagesLayout';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import SuccessImage from '../../assets/images/success.png';

export const ResetPasswordSuccess = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <AuthPagesLayout>
      <div className="flex flex-col min-h-screen justify-center items-center bg-white">
        {/* Minimal back arrow */}
        <button
          onClick={() => handleLoginClick(-1)}
          className="absolute top-14 left-12 text-gray-700 hover:text-gray-900"
          aria-label="Back"
        >
          <FiArrowLeft size={22} />
        </button>

        <div className="w-full max-w-md flex flex-col items-center text-center">
          {/* Success Icon with animated dots */}
          <div className="relative mb-8">
            <img width={'150px'} className="" src={SuccessImage} />
          </div>

          {/* Success Message */}
          <h2 className="text-3xl font-semibold text-gray-900 mb-3">You're All Set!</h2>
          <p className="text-gray-500 text-base mb-2">Password reset successful.</p>
          <p className="text-gray-500 text-base mb-12">Login to continue</p>

          {/* Login Button */}
          <CustomButton
            onClick={handleLoginClick}
            className="bg-[#052041] hover:bg-[#021024] text-white rounded-full w-full py-4 text-base font-semibold"
          >
            Login
          </CustomButton>
        </div>
      </div>
    </AuthPagesLayout>
  );
};
