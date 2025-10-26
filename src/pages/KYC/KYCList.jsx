import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GetKYCListService } from '../../services/kycService';
import PageLoading from '../../components/Loaders/PageLoading';
import TableLoading from '../../components/Loaders/TableLoading';
import Select from '../../components/CustomInput/Select';

const KYCList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kycData, setKycData] = useState([]);
  const [pageData, setPageData] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Filter states
  const [typeFilter, setTypeFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'merchant', label: 'Merchant' },
    { value: 'consumer', label: 'Consumer' },
  ];

  const paymentOptions = [
    { value: '', label: 'All Payment Status' },
    { value: 'true', label: 'Verified' },
    { value: 'false', label: 'Pending' },
  ];

  const fetchKYCData = async (page = 1) => {
    setIsLoadingData(true);
    try {
      const response = await GetKYCListService({
        page,
        type: typeFilter,
        paymentVerified: paymentFilter,
      });

      if (response?.success) {
        setKycData(response.data);
        setPageData({
          currentPage: response.meta.page,
          totalPages: response.meta.pageCount,
          totalItems: response.meta.itemCount,
        });
      }
    } catch (error) {
      console.error('Error fetching KYC data:', error);
    } finally {
      setIsLoadingData(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCData(1);
  }, [typeFilter, paymentFilter]);

  const handlePageChange = (page) => {
    fetchKYCData(page);
  };

  const handleTypeFilterChange = (value) => {
    setTypeFilter(value);
  };

  const handlePaymentFilterChange = (value) => {
    setPaymentFilter(value);
  };

  const handleViewDetails = (id) => {
    navigate(`/app/kyc/${id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <PageLoading msg="Loading KYC Data..." />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">KYC Management</h1>
        <p className="text-gray-500">Manage and verify KYC submissions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-64">
          <Select
            label="Type"
            onChange={handleTypeFilterChange}
            value={typeFilter}
            options={typeOptions}
            className="w-full"
          />
        </div>
        <div className="w-64">
          <Select
            label="Payment Status"
            onChange={handlePaymentFilterChange}
            value={paymentFilter}
            options={paymentOptions}
            className="w-full"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoadingData ? (
          <TableLoading />
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payment Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kycData.length > 0 ? (
                  kycData.map((kyc) => (
                    <tr key={kyc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                        {kyc.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {kyc.type === 'merchant' ? kyc.businessName : kyc.fullName || kyc.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {kyc.type === 'merchant' ? kyc.contactEmail : kyc.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(kyc.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            kyc.paymentVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {kyc.paymentVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                          onClick={() => handleViewDetails(kyc.id)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No KYC data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {true && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pageData.currentPage - 1)}
                    disabled={pageData.currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      pageData.currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pageData.currentPage + 1)}
                    disabled={pageData.currentPage === pageData.totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      pageData.currentPage === pageData.totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {kycData.length > 0 ? (pageData.currentPage - 1) * 10 + 1 : 0}
                      </span>{' '}
                      to <span className="font-medium">{Math.min(pageData.currentPage * 10, pageData.totalItems)}</span>{' '}
                      of <span className="font-medium">{pageData.totalItems}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pageData.currentPage - 1)}
                        disabled={pageData.currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                          pageData.currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Page numbers */}
                      {[...Array(pageData.totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageData.currentPage === i + 1
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-600 z-10'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(pageData.currentPage + 1)}
                        disabled={pageData.currentPage === pageData.totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                          pageData.currentPage === pageData.totalPages ? 'cursor-not-allowed' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default KYCList;
