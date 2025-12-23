import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ImSpinner2 } from 'react-icons/im';
import { FiArrowLeft } from 'react-icons/fi';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import { GetBakeriesOrdersService, GetBakeriesOrdersStatisticsDailyService } from '../../services/bakeriesService';
import { numberFormatter } from '../../utils/helper';
import empty from '../../assets/images/undraw_no-data.png';

export function BakeryOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const bakeryId = location.state?.bakeryId || location.pathname.split('/')[3];
  const bakeryName = location.state?.bakeryName || 'Bakery';

  const [loading, setLoading] = useState(true);
  const [dailyStatsLoading, setDailyStatsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [dailyStatistics, setDailyStatistics] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

  useEffect(() => {
    if (bakeryId) {
      fetchOrders();
      fetchDailyStatistics();
    }
  }, [bakeryId, currentPage, selectedDate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await GetBakeriesOrdersService({
        id: bakeryId,
        page: currentPage,
        limit: perPage,
        startDate: selectedDate,
        endDate: selectedDate,
      });
      if (response?.data?.success) {
        setOrders(response.data.data || []);
        setTotalPages(response.data.totalPage || 1);
        setTotalData(response.data.totalData || 0);
        setPerPage(response.data.perPage || 10);
      } else if (response?.success) {
        setOrders(response.data || []);
        setTotalPages(response.totalPage || 1);
        setTotalData(response.totalData || 0);
        setPerPage(response.perPage || 10);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyStatistics = async () => {
    try {
      setDailyStatsLoading(true);
      const response = await GetBakeriesOrdersStatisticsDailyService(bakeryId, selectedDate);
      if (response?.data?.success) {
        setDailyStatistics(response.data.data);
      } else if (response?.success) {
        setDailyStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching daily statistics:', error);
    } finally {
      setDailyStatsLoading(false);
    }
  };

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected + 1);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      ready: 'bg-green-100 text-green-800',
      received: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800',
    };
    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status || 'N/A'}
      </span>
    );
  };

  const StatCard = ({ title, value, isLoading }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <ImSpinner2 className="animate-spin" size={16} />
          <span className="text-gray-400">Loading...</span>
        </div>
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  );

  return (
    <div className="py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(`/app/bakeries/${bakeryId}`, { state: { id: bakeryId } })}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{bakeryName} - Orders</h1>
          <p className="text-sm text-gray-500">All Orders</p>
        </div>
      </div>

      {/* Daily Statistics */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Daily Statistics</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {dailyStatistics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Orders" value={dailyStatistics.totalOrders || 0} isLoading={dailyStatsLoading} />
            <StatCard
              title="Total Revenue"
              value={dailyStatistics.totalRevenue ? numberFormatter(dailyStatistics.totalRevenue) : '₦0'}
              isLoading={dailyStatsLoading}
            />
            <StatCard
              title="Bakery Earnings"
              value={dailyStatistics.totalBakeryEarnings ? numberFormatter(dailyStatistics.totalBakeryEarnings) : '₦0'}
              isLoading={dailyStatsLoading}
            />
            <StatCard
              title="Platform Commission"
              value={
                dailyStatistics.totalPlatformCommission
                  ? numberFormatter(dailyStatistics.totalPlatformCommission)
                  : '₦0'
              }
              isLoading={dailyStatsLoading}
            />
            <StatCard title="Total Items" value={dailyStatistics.totalItems || 0} isLoading={dailyStatsLoading} />
            <StatCard
              title="Average Order Value"
              value={dailyStatistics.averageOrderValue ? numberFormatter(dailyStatistics.averageOrderValue) : '₦0'}
              isLoading={dailyStatsLoading}
            />
            {dailyStatistics.capacity && (
              <>
                <StatCard
                  title="Total Capacity"
                  value={dailyStatistics.capacity.totalMaximumCapacity || 0}
                  isLoading={dailyStatsLoading}
                />
                <StatCard
                  title="Utilization"
                  value={`${dailyStatistics.capacity.utilizationPercentage || 0}%`}
                  isLoading={dailyStatsLoading}
                />
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 bg-white rounded-xl">
            <ImSpinner2 className="animate-spin" size={24} />
            <p className="ml-2 text-sm font-medium text-gray-600">Loading daily statistics...</p>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
        </div>

        {loading ? (
          <div className="py-24 flex items-center gap-2 justify-center">
            <ImSpinner2 className="animate-spin" size={20} />
            <p className="text-sm font-medium text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 flex flex-col justify-center items-center">
            <img className="w-32" src={empty} alt="no data" />
            <p className="font-medium text-gray-500">No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bakery Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Delivery
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderId || order._id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.orderDate ? moment(order.orderDate).format('MMM DD, YYYY HH:mm') : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.products?.map((product, idx) => (
                            <div key={idx} className="mb-1">
                              {product.productName} ({product.totalQuantity} {product.unit})
                            </div>
                          )) || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.totalItems || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.totalRevenue ? numberFormatter(order.totalRevenue) : '₦0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.bakeryEarnings ? numberFormatter(order.bakeryEarnings) : '₦0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.expectedDeliveryDate
                          ? moment(order.expectedDeliveryDate).format('MMM DD, YYYY HH:mm')
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * perPage, totalData)}</span> of{' '}
                  <span className="font-medium">{totalData}</span> results
                </div>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Next"
                  previousLabel="Previous"
                  onPageChange={handlePageChange}
                  pageRangeDisplayed={5}
                  pageCount={totalPages}
                  forcePage={currentPage - 1}
                  containerClassName="flex items-center gap-2"
                  pageClassName="w-8 h-8 flex justify-center items-center font-semibold text-gray-700 rounded-md hover:bg-gray-100"
                  pageLinkClassName="w-full h-full flex items-center justify-center"
                  activeClassName="bg-gray-200"
                  previousClassName="px-3 py-1 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                  nextClassName="px-3 py-1 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                  disabledClassName="opacity-50 cursor-not-allowed"
                  renderOnZeroPageCount={null}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
