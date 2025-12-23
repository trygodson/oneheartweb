import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImSpinner2 } from 'react-icons/im';
import { MdRefresh } from 'react-icons/md';
import { FiX } from 'react-icons/fi';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import {
  GetOverallShopOrdersService,
  GetShopOrdersStatisticsService,
  GetShopOrderDetailByIdService,
} from '../../services/shopOrdersService';
import { numberFormatter } from '../../utils/helper';
import empty from '../../assets/images/undraw_no-data.png';

export function ShopOrders() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [ordersData, setOrdersData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [businessIdFilter, setBusinessIdFilter] = useState('');
  const [startDate, setStartDate] = useState(moment().subtract(30, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await GetOverallShopOrdersService({
        page,
        limit: perPage,
        status: statusFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        businessId: businessIdFilter || undefined,
        startDate,
        endDate,
      });

      console.log('response', response);
      if (response?.success) {
        setOrdersData(response);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await GetShopOrdersStatisticsService({ date: endDate });
      if (response?.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchOrderDetail = async (id) => {
    try {
      setDetailLoading(true);
      const response = await GetShopOrderDetailByIdService(id);
      if (response?.success) {
        setOrderDetail(response.data);
        setDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
    fetchStatistics();
  }, [currentPage, statusFilter, paymentStatusFilter, businessIdFilter, startDate, endDate]);

  const handlePageChange = (pageIndex) => {
    const newPage = pageIndex.selected + 1;
    setCurrentPage(newPage);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchOrders(1);
    fetchStatistics();
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      ready: 'bg-green-100 text-green-800',
      confirmed: 'bg-blue-100 text-blue-800',
      received: 'bg-yellow-100 text-yellow-800',
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

  const getPaymentStatusBadge = (status) => {
    const statusColors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
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

  const stats = statistics || {};

  return (
    <div className="py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shop Orders</h1>
          <p className="text-sm text-gray-500">Manage and view all shop orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/shop-orders/delivery-zone-classification')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View by Delivery Zone
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <MdRefresh size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Date</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={moment().format('YYYY-MM-DD')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Orders" value={stats.totalOrders || 0} isLoading={statsLoading} />
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue ? numberFormatter(stats.totalRevenue) : '₦0'}
            isLoading={statsLoading}
          />
          <StatCard title="Total Items" value={stats.totalItems || 0} isLoading={statsLoading} />
          <StatCard
            title="Average Order Value"
            value={stats.averageOrderValue ? numberFormatter(stats.averageOrderValue) : '₦0'}
            isLoading={statsLoading}
          />
        </div>

        {/* Recent Activity */}
        {stats.recentActivity && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Last 7 Days</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Orders:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.recentActivity.last7Days?.orders || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {numberFormatter(stats.recentActivity.last7Days?.revenue || 0)}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Last 30 Days</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Orders:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.recentActivity.last30Days?.orders || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {numberFormatter(stats.recentActivity.last30Days?.revenue || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="ready">Ready</option>
              <option value="confirmed">Confirmed</option>
              <option value="received">Received</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business ID</label>
            <input
              type="text"
              value={businessIdFilter}
              onChange={(e) => {
                setBusinessIdFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Enter business ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
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
        ) : !ordersData?.data || ordersData.data.length === 0 ? (
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
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Delivery
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordersData.data.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => fetchOrderDetail(order._id)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber || order._id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.businessName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.orderDate ? moment(order.orderDate).format('MMM DD, YYYY HH:mm') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.itemsCount || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.totalAmount ? numberFormatter(order.totalAmount) : '₦0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getPaymentStatusBadge(order.paymentStatus)}</td>
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
            {ordersData.totalPage > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * perPage, ordersData.totalData || 0)}</span> of{' '}
                  <span className="font-medium">{ordersData.totalData || 0}</span> results
                </div>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Next"
                  previousLabel="Previous"
                  onPageChange={handlePageChange}
                  pageRangeDisplayed={5}
                  pageCount={ordersData.totalPage || 1}
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

      {/* Order Detail Modal */}
      {detailModalOpen && (
        <div
          data-modal-backdrop
          className="fixed inset-0 bg-black/60 overflow-hidden grid place-content-center z-[10001]"
          onClick={() => setDetailModalOpen(false)}
        >
          <div
            data-modal
            className="bg-white rounded-xl p-6 min-w-[800px] max-w-[900px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 flex items-center gap-2 justify-center">
                <ImSpinner2 className="animate-spin" size={20} />
                <p className="text-sm font-medium text-gray-600">Loading order details...</p>
              </div>
            ) : orderDetail ? (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order Number</p>
                    <p className="text-sm font-medium text-gray-900">{orderDetail.orderNumber || orderDetail._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {orderDetail.orderDate ? moment(orderDetail.orderDate).format('MMM DD, YYYY HH:mm') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <div>{getStatusBadge(orderDetail.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                    <div>{getPaymentStatusBadge(orderDetail.paymentStatus)}</div>
                  </div>
                  {orderDetail.paymentReference && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Payment Reference</p>
                      <p className="text-sm font-medium text-gray-900">{orderDetail.paymentReference}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Expected Delivery</p>
                    <p className="text-sm font-medium text-gray-900">
                      {orderDetail.expectedDeliveryDate
                        ? moment(orderDetail.expectedDeliveryDate).format('MMM DD, YYYY HH:mm')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Business Info */}
                {orderDetail.business && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Business Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Business Name</p>
                        <p className="text-sm font-medium text-gray-900">
                          {orderDetail.business.businessName || 'N/A'}
                        </p>
                      </div>
                      {orderDetail.business.contactPerson && (
                        <>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Contact Person</p>
                            <p className="text-sm font-medium text-gray-900">
                              {orderDetail.business.contactPerson.name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Phone</p>
                            <p className="text-sm font-medium text-gray-900">
                              {orderDetail.business.contactPerson.phone || 'N/A'}
                            </p>
                          </div>
                          {orderDetail.business.contactPerson.email && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Email</p>
                              <p className="text-sm font-medium text-gray-900">
                                {orderDetail.business.contactPerson.email}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                {orderDetail.deliveryAddress && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Delivery Address</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900">{orderDetail.deliveryAddress.street || 'N/A'}</p>
                      {orderDetail.deliveryAddress.phone && (
                        <p className="text-sm text-gray-600">Phone: {orderDetail.deliveryAddress.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                {orderDetail.items && orderDetail.items.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bakery</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Quantity
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orderDetail.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.productName || 'N/A'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.bakeryName || 'N/A'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {item.quantity} {item.unit || ''}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {item.price ? numberFormatter(item.price) : '₦0'}
                              </td>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                {item.totalPrice ? numberFormatter(item.totalPrice) : '₦0'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {orderDetail.subtotal ? numberFormatter(orderDetail.subtotal) : '₦0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Delivery Fee:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {orderDetail.deliveryFee ? numberFormatter(orderDetail.deliveryFee) : '₦0'}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-semibold text-gray-900">Total Amount:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {orderDetail.totalAmount ? numberFormatter(orderDetail.totalAmount) : '₦0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status History */}
                {orderDetail.statusHistory && orderDetail.statusHistory.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Status History</h4>
                    <div className="space-y-3">
                      {orderDetail.statusHistory.map((history, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900 capitalize">{history.status}</span>
                              <span className="text-xs text-gray-500">
                                {history.timestamp ? moment(history.timestamp).format('MMM DD, YYYY HH:mm') : 'N/A'}
                              </span>
                            </div>
                            {history.note && <p className="text-xs text-gray-600">{history.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500">No order details available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
