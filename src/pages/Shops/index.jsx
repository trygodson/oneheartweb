import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImSpinner2 } from 'react-icons/im';
import { MdRefresh } from 'react-icons/md';
import ReactPaginate from 'react-paginate';
import { GetShopsService, GetOverallShopStatsService } from '../../services/shopsService';
import { numberFormatter } from '../../utils/helper';
import moment from 'moment';
import empty from '../../assets/images/undraw_no-data.png';

export function Shops() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [shopsData, setShopsData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchShops = async (page = 1, status = '') => {
    try {
      setLoading(true);
      const response = await GetShopsService({ page, limit: perPage, status: status || undefined });
      if (response?.success) {
        setShopsData(response);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await GetOverallShopStatsService();
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
    fetchShops(currentPage, statusFilter);
    fetchStatistics();
  }, [currentPage, statusFilter]);

  const handlePageChange = (pageIndex) => {
    const newPage = pageIndex.selected + 1;
    setCurrentPage(newPage);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setStatusFilter('');
    fetchShops(1, '');
    fetchStatistics();
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const stats = statistics?.data || {};

  return (
    <div className="p-6">
      {/* Statistics Cards */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Shops Overview</h2>
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
            {/* Total Shops */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Total Shops</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalShops || 0}</p>
            </div>

            {/* Verified Shops */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Verified</p>
              <p className="text-2xl font-bold text-green-600">{stats.verifiedCount || 0}</p>
            </div>

            {/* Unverified Shops */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Unverified</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.unverifiedCount || 0}</p>
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

            {/* Total Items */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Total Items</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalItems || 0}</p>
            </div>

            {/* Average Order Value */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Average Order Value</p>
              <p className="text-2xl font-bold text-indigo-600">{numberFormatter(stats.averageOrderValue || 0)}</p>
            </div>

            {/* Average Orders Per Shop */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Avg Orders/Shop</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageOrdersPerShop || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Shops Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Shops List</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
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
                    <th className="text-sm py-3 border-y font-semibold">Business Name</th>
                    <th className="text-sm py-3 border-y font-semibold">Business Type</th>
                    <th className="text-sm py-3 border-y font-semibold">Contact Person</th>
                    <th className="text-sm py-3 border-y font-semibold">Address</th>
                    <th className="text-sm py-3 border-y font-semibold">Phone</th>
                    <th className="text-sm py-3 border-y font-semibold">Status</th>
                    <th className="text-sm py-3 border-y font-semibold">Verified</th>
                    <th className="text-sm py-3 border-y font-semibold">Created At</th>
                  </tr>
                </thead>
                {shopsData?.data && shopsData.data.length > 0 && (
                  <tbody>
                    {shopsData.data.map((shop) => (
                      <tr
                        key={shop._id}
                        onClick={() => navigate(`/app/shops/${shop._id}`, { state: { id: shop._id } })}
                        className="cursor-pointer pt-3 transition-all duration-300 shadow-sm hover:shadow-md bg-white mb-2"
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{shop.businessName}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 capitalize">{shop.businessType || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{shop.contactPerson?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {shop.contactAddresses?.find((addr) => addr.isDefault)?.address ||
                            shop.contactAddresses?.[0]?.address ||
                            'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {shop.contactPerson?.phone || shop.user?.phone || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              shop.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : shop.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : shop.status === 'suspended'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {shop.status || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              shop.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {shop.isVerified ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {shop.createdAt ? moment(shop.createdAt).format('MMM DD, YYYY') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>

            {!loading && (!shopsData?.data || shopsData.data.length === 0) && (
              <div className="py-20 flex flex-col justify-center items-center">
                <img className="w-32" src={empty} alt="no data" />
                <p className="font-medium flex justify-center">No shops found</p>
              </div>
            )}

            {shopsData?.data && shopsData.data.length > 0 && (
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
                  pageCount={shopsData.totalPage || 1}
                  pageRangeDisplayed={shopsData.totalPage || 1}
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
