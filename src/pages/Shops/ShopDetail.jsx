import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ImSpinner2 } from 'react-icons/im';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import {
  GetShopDetailsByIdService,
  GetShopStatsByIdService,
  GetShopOrdersService,
  AssignDeliveryZoneToShopService,
} from '../../services/shopsService';
import { getDeliveryZoneAction } from '../../store/slices/deliveryZone';
import { numberFormatter } from '../../utils/helper';
import customToast from '../../components/Toast/toastify';
import empty from '../../assets/images/undraw_no-data.png';

export function ShopDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const shopId = location.state?.id || location.pathname.split('/').pop();

  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [assignZoneModalOpen, setAssignZoneModalOpen] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState('');

  const deliveryZones = useSelector((state) => state.deliveryZone?.response || []);

  useEffect(() => {
    if (shopId) {
      fetchShopDetails();
      fetchStatistics();
      fetchOrders();
    }
    // Fetch delivery zones from Redux store
    dispatch(getDeliveryZoneAction());
  }, [shopId, dispatch]);

  useEffect(() => {
    if (shopId) {
      fetchOrders();
    }
  }, [currentPage]);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const response = await GetShopDetailsByIdService(shopId);
      if (response?.data?.success) {
        setShop(response.data.data);
      } else if (response?.success) {
        setShop(response.data);
      }
    } catch (error) {
      console.error('Error fetching shop details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await GetShopStatsByIdService(shopId);
      if (response?.data?.success) {
        setStatistics(response.data.data);
      } else if (response?.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await GetShopOrdersService({
        id: shopId,
        page: currentPage,
        limit: perPage,
        startDate: moment().subtract(1, 'year').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
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
      setOrdersLoading(false);
    }
  };

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected + 1);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      ready: 'bg-green-100 text-green-800',
      confirmed: 'bg-blue-100 text-blue-800',
      received: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
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

  if (loading) {
    return (
      <div className="py-24 flex items-center gap-2 justify-center">
        <ImSpinner2 className="animate-spin" size={24} />
        <p className="text-sm font-medium text-gray-600">Loading shop details...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="py-20 flex flex-col justify-center items-center">
        <p className="font-medium text-gray-500 mb-4">Shop not found</p>
        <button
          onClick={() => navigate('/app/shops')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Back to Shops
        </button>
      </div>
    );
  }

  const defaultAddress = shop.contactAddresses?.find((addr) => addr.isDefault) || shop.contactAddresses?.[0];

  return (
    <div className="py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/app/shops')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{shop.businessName}</h1>
          <p className="text-sm text-gray-500">Shop Details</p>
        </div>
        <button
          onClick={() => {
            setSelectedZoneId(shop.deliveryZone ? shop.deliveryZone._id : '');
            setAssignZoneModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Assign Delivery Zone
        </button>
      </div>

      {/* Shop Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{shop.businessName}</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Business Type</p>
                <p className="text-sm text-gray-900 capitalize">{shop.businessType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <div>{getStatusBadge(shop.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Verification Status</p>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    shop.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {shop.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Contact Person</p>
              <p className="text-sm text-gray-900">{shop.contactPerson?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="text-sm text-gray-900">{shop.contactPerson?.phone || shop.user?.phone || 'N/A'}</p>
            </div>
            {shop.contactPerson?.email && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-sm text-gray-900">{shop.contactPerson.email}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-1">Address</p>
              <p className="text-sm text-gray-900">{defaultAddress?.address || 'N/A'}</p>
            </div>
            {shop.contactAddresses && shop.contactAddresses.length > 1 && (
              <div>
                <p className="text-sm text-gray-500 mb-1">All Addresses</p>
                <div className="space-y-1">
                  {shop.contactAddresses.map((addr) => (
                    <p key={addr._id} className="text-xs text-gray-600">
                      {addr.isDefault && <span className="font-medium">(Default) </span>}
                      {addr.address}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-1">Created</p>
              <p className="text-sm text-gray-900">{moment(shop.createdAt).format('MMM DD, YYYY')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Delivery Zone</p>
              {shop.deliveryZone ? (
                <div>
                  <p className="text-sm font-medium text-gray-900">{shop.deliveryZone.name || 'N/A'}</p>
                  {shop.deliveryZone.description && (
                    <p className="text-xs text-gray-500 mt-1">{shop.deliveryZone.description}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No delivery zone assigned</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Orders" value={statistics.totalOrders || 0} isLoading={statsLoading} />
            <StatCard
              title="Total Revenue"
              value={statistics.totalRevenue ? numberFormatter(statistics.totalRevenue) : '₦0'}
              isLoading={statsLoading}
            />
            <StatCard title="Total Items" value={statistics.totalItems || 0} isLoading={statsLoading} />
            <StatCard
              title="Average Order Value"
              value={statistics.averageOrderValue ? numberFormatter(statistics.averageOrderValue) : '₦0'}
              isLoading={statsLoading}
            />
            {statistics.firstOrderDate && (
              <StatCard
                title="First Order"
                value={moment(statistics.firstOrderDate).format('MMM DD, YYYY')}
                isLoading={statsLoading}
              />
            )}
            {statistics.lastOrderDate && (
              <StatCard
                title="Last Order"
                value={moment(statistics.lastOrderDate).format('MMM DD, YYYY')}
                isLoading={statsLoading}
              />
            )}
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
        </div>

        {ordersLoading ? (
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
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
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
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber || order._id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.orderDate ? moment(order.orderDate).format('MMM DD, YYYY HH:mm') : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="mb-1">
                              {item.productName} ({item.quantity} {item.unit}) - {item.bakeryName}
                            </div>
                          )) || 'N/A'}
                        </div>
                      </td>
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

      {/* Assign Delivery Zone Modal */}
      {assignZoneModalOpen && (
        <div
          data-modal-backdrop
          className="fixed inset-0 bg-black/60 overflow-hidden grid place-content-center z-[10001]"
          onClick={() => setAssignZoneModalOpen(false)}
        >
          <div
            data-modal
            className="bg-white rounded-xl p-6 min-w-[500px] max-w-[600px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assign Delivery Zone</h3>
              <button
                onClick={() => setAssignZoneModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={actionLoading}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{shop.businessName}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Delivery Zone <span className="text-red-500">*</span>
                </label>
                {deliveryZones.length === 0 ? (
                  <p className="text-sm text-gray-500">No delivery zones available</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {deliveryZones.map((zone) => (
                      <label
                        key={zone._id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="deliveryZone"
                          checked={selectedZoneId === zone._id}
                          onChange={() => setSelectedZoneId(zone._id)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          disabled={actionLoading}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{zone.name}</p>
                          {zone.description && (
                            <p className="text-xs text-gray-500">{zone.description}</p>
                          )}
                          {zone.deliveryTimeWindows && zone.deliveryTimeWindows.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {zone.deliveryTimeWindows.map((window, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                                >
                                  {window}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setAssignZoneModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedZoneId) {
                    customToast('Please select a delivery zone', true);
                    return;
                  }
                  try {
                    setActionLoading(true);
                    const response = await AssignDeliveryZoneToShopService(shopId, selectedZoneId);
                    if (response?.data?.success || response?.success) {
                      customToast('Delivery zone assigned successfully');
                      setAssignZoneModalOpen(false);
                      fetchShopDetails();
                    } else {
                      customToast(
                        response?.data?.message || response?.message || 'Failed to assign delivery zone',
                        true
                      );
                    }
                  } catch (error) {
                    console.error('Error assigning delivery zone:', error);
                    customToast(error?.message || 'Failed to assign delivery zone', true);
                  } finally {
                    setActionLoading(false);
                  }
                }}
                disabled={actionLoading || !selectedZoneId}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <ImSpinner2 className="animate-spin" size={16} />}
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

