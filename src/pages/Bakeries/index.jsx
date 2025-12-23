import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImSpinner2 } from 'react-icons/im';
import { MdRefresh } from 'react-icons/md';
import ReactPaginate from 'react-paginate';
import { GetBakeriesService, GetBakeriesStatisticsService } from '../../services/bakeriesService';
import { numberFormatter } from '../../utils/helper';
import moment from 'moment';
import empty from '../../assets/images/undraw_no-data.png';

export function Bakeries() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [bakeriesData, setBakeriesData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  const fetchBakeries = async (page = 1) => {
    try {
      setLoading(true);
      const response = await GetBakeriesService({ page, limit: perPage });
      if (response?.success) {
        setBakeriesData(response.data);
      }
    } catch (error) {
      console.error('Error fetching bakeries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await GetBakeriesStatisticsService();
      // console.log('response', response);

      if (response?.success) {
        setStatistics(response);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchBakeries(currentPage);
    fetchStatistics();
  }, [currentPage]);

  const handlePageChange = (pageIndex) => {
    const newPage = pageIndex.selected + 1;
    setCurrentPage(newPage);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchBakeries(1);
    fetchStatistics();
  };

  const stats = statistics?.data || {};

  return (
    <div className="p-6">
      {/* Statistics Cards */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Bakeries Overview</h2>
          <button
            onClick={handleRefresh}
            className="p-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <MdRefresh size={22} color="black" />
          </button>
        </div>

        {statsLoading ? (
          <div className="flex items-center justify-center py-12">
            <ImSpinner2 className="animate-spin" size={24} />
            <p className="ml-2 text-sm font-medium">Loading statistics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Bakeries */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Total Bakeries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBakeries || 0}</p>
            </div>

            {/* Approved Bakeries */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approvedCount || 0}</p>
            </div>

            {/* Pending Bakeries */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount || 0}</p>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600">{numberFormatter(stats.totalRevenue || 0)}</p>
            </div>

            {/* Total Earnings */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-purple-600">{numberFormatter(stats.totalBakeryEarnings || 0)}</p>
            </div>

            {/* Platform Commission */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Platform Commission</p>
              <p className="text-2xl font-bold text-indigo-600">
                {numberFormatter(stats.totalPlatformCommission || 0)}
              </p>
            </div>

            {/* Total Products */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bakeries Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Bakeries List</h3>
        </div>

        {loading ? (
          <div className="py-24 flex items-center gap-1 justify-center text-sm p-2 font-medium">
            <ImSpinner2 className="animate-spin" />
            <p>Loading</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left opacity-70 font-semibold">
                    <th className="text-sm py-3 border-y font-semibold">Logo</th>
                    <th className="text-sm py-3 border-y font-semibold">Bakery Name</th>
                    <th className="text-sm py-3 border-y font-semibold">Address</th>
                    <th className="text-sm py-3 border-y font-semibold">Status</th>
                    <th className="text-sm py-3 border-y font-semibold">Approved</th>
                    <th className="text-sm py-3 border-y font-semibold">Email</th>
                    <th className="text-sm py-3 border-y font-semibold">Created At</th>
                  </tr>
                </thead>
                {bakeriesData && bakeriesData.length > 0 && (
                  <tbody>
                    {bakeriesData.map((bakery) => (
                      <tr
                        key={bakery._id}
                        onClick={() => navigate(`/app/bakeries/${bakery._id}`, { state: { id: bakery._id } })}
                        className="cursor-pointer pt-3 transition-all duration-300 shadow-sm hover:shadow-md bg-white mb-2"
                      >
                        <td className="py-3 px-4">
                          <img
                            src={bakery.logo || 'https://via.placeholder.com/50'}
                            alt={bakery.bakeryName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{bakery.bakeryName}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {bakery.address
                            ? `${bakery.address.street}, ${bakery.address.city}, ${bakery.address.state}`
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              bakery.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {bakery.status || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              bakery.isApproved ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {bakery.isApproved ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{bakery.user?.email || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {bakery.createdAt ? moment(bakery.createdAt).format('MMM DD, YYYY') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>

            {!loading && (!bakeriesData || bakeriesData.length === 0) && (
              <div className="py-20 flex flex-col justify-center items-center">
                <img className="w-32" src={empty} alt="no data" />
                <p className="font-medium flex justify-center">No bakeries found</p>
              </div>
            )}

            {bakeriesData && bakeriesData.length > 0 && (
              <div className="w-full flex justify-center mt-4">
                <ReactPaginate
                  breakClassName={'page-item'}
                  breakLinkClassName={'page-link'}
                  containerClassName={'flex justify-center gap-2'}
                  pageClassName={
                    'w-8 h-8 flex justify-center items-center font-semibold text-primary rounded-md cursor-pointer hover:bg-gray-100'
                  }
                  pageLinkClassName={''}
                  previousClassName={
                    'w-8 h-8 flex justify-center items-center font-semibold text-primary rounded-md cursor-pointer hover:bg-gray-100'
                  }
                  previousLinkClassName={'text-sm'}
                  nextClassName={
                    'w-8 h-8 flex justify-center items-center font-semibold text-primary rounded-md cursor-pointer hover:bg-gray-100'
                  }
                  nextLinkClassName={'text-sm'}
                  activeClassName={'bg-gray-300'}
                  initialPage={currentPage - 1}
                  pageCount={bakeriesData.totalPage || 1}
                  pageRangeDisplayed={bakeriesData.totalPage || 1}
                  onPageChange={handlePageChange}
                  previousLabel={'<'}
                  nextLabel={'>'}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
