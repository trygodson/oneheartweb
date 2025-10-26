import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GetKYCDetailsService, VerifyKYCPaymentService } from '../../services/kycService';
import PageLoading from '../../components/Loaders/PageLoading';
import FileViewerModal from '../../components/Modal/FileViewerModal';
import { toast } from 'react-toastify';

const KYCDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kycDetails, setKycDetails] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState('');

  useEffect(() => {
    fetchKYCDetails();
  }, [id]);

  const fetchKYCDetails = async () => {
    setLoading(true);
    try {
      const response = await GetKYCDetailsService(id);
      if (response) {
        setKycDetails(response);
      }
    } catch (error) {
      console.error('Error fetching KYC details:', error);
      toast.error('Failed to load KYC details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    setIsVerifying(true);
    try {
      const response = await VerifyKYCPaymentService(id);
      if (response) {
        toast.success('Payment verified successfully');
        fetchKYCDetails(); // Refresh details
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    } finally {
      setIsVerifying(false);
    }
  };

  const openImageModal = (url, fileType = 'image/jpeg') => {
    setSelectedImage(url);
    setSelectedFileType(fileType);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <PageLoading msg="Loading KYC Details..." />;
  }

  if (!kycDetails) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">KYC details not found</h2>
        <button
          onClick={() => navigate('/app/kyc')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to KYC List
        </button>
      </div>
    );
  }

  const isMerchant = kycDetails.type === 'merchant';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            KYC Details: {isMerchant ? kycDetails.businessName : kycDetails.fullName || kycDetails.email}
          </h1>
          <p className="text-gray-500 capitalize">{kycDetails.type} Application</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/app/kyc')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to List
          </button>
          {!kycDetails.paymentVerified && (
            <button
              onClick={handleVerifyPayment}
              disabled={isVerifying}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Verify Payment'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        {/* Status Banner */}
        <div
          className={`px-4 py-5 border-b border-gray-200 ${
            kycDetails.paymentVerified ? 'bg-green-50' : 'bg-yellow-50'
          }`}
        >
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <span
              className={`inline-block h-3 w-3 rounded-full mr-2 ${
                kycDetails.paymentVerified ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            ></span>
            Payment Status: {kycDetails.paymentVerified ? 'Verified' : 'Pending Verification'}
          </h3>
        </div>

        {/* Basic Details */}
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(kycDetails.createdAt)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(kycDetails.updatedAt)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Referral Code</dt>
              <dd className="mt-1 text-sm text-gray-900">{kycDetails.referer || 'N/A'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Main Details Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {isMerchant ? 'Business Information' : 'Personal Information'}
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            {isMerchant ? (
              /* Merchant Details */
              <>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Business Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.businessName || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Business Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.businessType || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.registrationNumber || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.taxId || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Business Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.businessAddress || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.contactPerson || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Contact Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.contactPhone || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.contactEmail || 'N/A'}</dd>
                </div>
              </>
            ) : (
              /* Consumer Details */
              <>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.fullName || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.email || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.phone || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.dob ? formatDate(kycDetails.dob) : 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{kycDetails.gender || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.address || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">ID Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.idType || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">ID Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{kycDetails.idNumber || 'N/A'}</dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Uploaded Documents</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-6">
            {isMerchant ? (
              <>
                {kycDetails.registrationDoc && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-2">Business Registration</span>
                    <div
                      className="relative h-48 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => openImageModal(kycDetails.registrationDoc)}
                    >
                      <img
                        src={kycDetails.registrationDoc}
                        alt="Business Registration"
                        className="h-full w-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 hover:opacity-100">Click to view</span>
                      </div>
                    </div>
                  </div>
                )}
                {kycDetails.ownerId && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-2">Owner ID</span>
                    <div
                      className="relative h-48 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => openImageModal(kycDetails.ownerId)}
                    >
                      <img src={kycDetails.ownerId} alt="Owner ID" className="h-full w-full object-contain" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 hover:opacity-100">Click to view</span>
                      </div>
                    </div>
                  </div>
                )}
                {kycDetails.ownerSelfie && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-2">Owner Selfie</span>
                    <div
                      className="relative h-48 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => openImageModal(kycDetails.ownerSelfie)}
                    >
                      <img src={kycDetails.ownerSelfie} alt="Owner Selfie" className="h-full w-full object-contain" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 hover:opacity-100">Click to view</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {kycDetails.idPhoto && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-2">ID Photo</span>
                    <div
                      className="relative h-48 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => openImageModal(kycDetails.idPhoto)}
                    >
                      <img src={kycDetails.idPhoto} alt="ID Photo" className="h-full w-full object-contain" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 hover:opacity-100">Click to view</span>
                      </div>
                    </div>
                  </div>
                )}
                {kycDetails.selfie && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-2">Selfie</span>
                    <div
                      className="relative h-48 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => openImageModal(kycDetails.selfie)}
                    >
                      <img src={kycDetails.selfie} alt="Selfie" className="h-full w-full object-contain" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 hover:opacity-100">Click to view</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Proof of Payment - Common for both types */}
            {kycDetails.proofOfPayment && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500 mb-2">Proof of Payment</span>
                <div
                  className="relative h-48 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => openImageModal(kycDetails.proofOfPayment)}
                >
                  <img
                    src={kycDetails.proofOfPayment}
                    alt="Proof of Payment"
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center">
                    <span className="text-white font-medium opacity-0 hover:opacity-100">Click to view</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      <FileViewerModal isOpen={modalOpen} onClose={closeModal} file={selectedImage} fileType={selectedFileType} />
    </div>
  );
};

export default KYCDetails;
