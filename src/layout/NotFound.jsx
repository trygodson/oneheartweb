import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import CustomButton from '../components/Buttons/CustomButton';

export const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/app/home');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Animation/Icon */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-9xl font-bold text-gray-200 select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.09m0 0L4 20l3.091-2.909z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Page Not Found</h2>
          <p className="text-gray-600 text-lg mb-2">The page you're looking for doesn't exist.</p>
          <p className="text-gray-500 text-sm">It might have been moved, deleted, or you entered the wrong URL.</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <CustomButton
            onClick={handleGoHome}
            className="w-full py-3 px-6 !bg-[#052041] hover:!bg-[#041a35] !text-white font-medium !rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <FiHome size={18} />
            Go to Dashboard
          </CustomButton>

          <CustomButton
            onClick={handleGoBack}
            className="w-full py-3 px-6 !bg-gray-100 hover:!bg-gray-200 !text-gray-700 font-medium !rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <FiArrowLeft size={18} />
            Go Back
          </CustomButton>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">Need help? Contact our support team or check your permissions.</p>
        </div>
      </div>
    </div>
  );
};
