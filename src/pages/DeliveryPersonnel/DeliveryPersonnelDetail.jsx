import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImSpinner2 } from 'react-icons/im';
import { MdRefresh } from 'react-icons/md';
import { FiX } from 'react-icons/fi';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import { GetDeliveryPersonelOrdersService, markOrderAsCompletedService } from '../../services/deliveryPersonelService';
import { numberFormatter } from '../../utils/helper';
import empty from '../../assets/images/undraw_no-data.png';
import customToast from '../../components/Toast/toastify';

export function DeliveryPersonnelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);
  const [startDate, setStartDate] = useState(moment().subtract(1, 'month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [markingDelivered, setMarkingDelivered] = useState(false);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await GetDeliveryPersonelOrdersService({
        personnelId: id,
        page,
        limit: perPage,
        startDate,
        endDate,
      });
      const payload = res?.data?.success ? res.data : res;
      if (payload?.success) setData(payload);
      else setData(null);
    } catch (e) {
      console.error('Error fetching delivery personnel orders:', e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchOrders(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentPage, startDate, endDate]);

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchOrders(1);
  };

  const handlePageChange = (pageIndex) => {
    setCurrentPage(pageIndex.selected + 1);
  };

  const showOrderDetail = (order) => {
    setOrderDetail(order);
    setDetailModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      ready: 'bg-green-100 text-green-800',
      confirmed: 'bg-blue-100 text-blue-800',
      received: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          statusColors[String(status || '').toLowerCase()] || 'bg-gray-100 text-gray-800'
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
          statusColors[String(status || '').toLowerCase()] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status || 'N/A'}
      </span>
    );
  };

  // Check if order status is delivered at top level
  const isOrderStatusDelivered = (order) => {
    const orderStatus = String(order?.status || '').toLowerCase();
    return orderStatus === 'delivered';
  };

  // Check if all assigned items are delivered
  const areAllItemsDelivered = (order) => {
    const assignedItems = Array.isArray(order?.assignedItems) ? order.assignedItems : [];
    const deliveryInfoItems = Array.isArray(order?.deliveryInfo?.items) ? order.deliveryInfo.items : [];

    if (assignedItems.length === 0) return false;

    // Create a map of delivered items by productId
    const deliveredItemsMap = new Map();
    deliveryInfoItems.forEach((deliveredItem) => {
      const productId = deliveredItem.productId;
      if (productId) {
        deliveredItemsMap.set(productId, deliveredItem);
      }
    });

    // Check if all assigned items have been delivered
    return assignedItems.every((assignedItem) => {
      const productId = assignedItem.productId;
      if (!productId) return false;

      // Check if item exists in deliveryInfo.items (meaning it's been delivered)
      const deliveredItem = deliveredItemsMap.get(productId);
      return !!deliveredItem && deliveredItem.status === 'delivered';
    });
  };

  // Check if order can be marked as completed (either all items delivered OR order status is delivered)
  const canMarkAsCompleted = (order) => {
    // return areAllItemsDelivered(order) || isOrderStatusDelivered(order);
    return isOrderStatusDelivered(order);
  };

  // Get proof of delivery for an item
  const getProofOfDelivery = (order, productId) => {
    if (!order?.deliveryInfo?.items || !productId) return null;
    const deliveryInfoItems = Array.isArray(order.deliveryInfo.items) ? order.deliveryInfo.items : [];
    return deliveryInfoItems.find((item) => item.productId === productId)?.proofOfDelivery || null;
  };

  // Check if order is completed (not just delivered)
  const isOrderCompleted = (o) => {
    const orderStatus = String(o?.status || '').toLowerCase();
    return orderStatus === 'completed';
  };

  const isOrderDelivered = (o) => {
    // Check if all assigned items are delivered
    if (areAllItemsDelivered(o)) return true;

    // Fallback to old logic
    const deliveryStatus = o?.deliveryInfo?.status || o?.deliveryStatus || o?.deliveryInfoStatus;
    if (deliveryStatus) return String(deliveryStatus).toLowerCase() === 'delivered';
    const orderStatus = o?.status;
    return String(orderStatus || '').toLowerCase() === 'delivered';
  };

  const updateOrderDeliveredInList = (orderId) => {
    setData((prev) => {
      if (!prev) return prev;
      const nextOrders = Array.isArray(prev.data)
        ? prev.data.map((o) =>
            o?._id === orderId ? { ...o, deliveryInfo: { ...(o.deliveryInfo || {}), status: 'delivered' } } : o,
          )
        : prev.data;
      return { ...prev, data: nextOrders };
    });
  };

  const markAsCompleted = async (orderId) => {
    try {
      if (!orderId) return;
      setMarkingDelivered(true);
      const res = await markOrderAsCompletedService(orderId, { note: 'delivered' });
      const ok = res?.data?.success || res?.success;
      if (!ok) {
        customToast(res?.data?.message || res?.message || 'Failed to mark as delivered', true);
        return;
      }
      customToast(res?.data?.message || res?.message || 'Order marked as delivered');
      updateOrderDeliveredInList(orderId);
      setOrderDetail((prev) =>
        prev && (prev?._id === orderId || prev?.orderId === orderId)
          ? { ...prev, deliveryInfo: { ...(prev.deliveryInfo || {}), status: 'delivered' } }
          : prev,
      );
    } catch (e) {
      console.error('markAsDelivered error:', e);
      customToast(e?.message || 'Failed to mark as delivered', true);
    } finally {
      setMarkingDelivered(false);
    }
  };

  const personnel = data?.deliveryPersonnel || null;
  const orders = data?.data || [];
  const stats = data?.stats || {};

  const personName = useMemo(() => {
    const u = personnel?.user;
    return `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || 'Delivery Personnel';
  }, [personnel]);

  const itemStatusCounts = stats?.itemStatusCounts || {};
  const orderStatusCounts = stats?.orderStatusCounts || {};

  const StatCard = ({ title, value }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-600 hover:text-gray-900 mb-2">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{personName}</h1>
          <p className="text-sm text-gray-500">Delivery Personnel Details & Orders</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <MdRefresh size={18} />
          Refresh
        </button>
      </div>

      {personnel && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Contact</p>
              <p className="text-sm font-medium text-gray-900">{personnel?.user?.phone || '—'}</p>
              <p className="text-sm text-gray-600">{personnel?.user?.email || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{personnel?.status || '—'}</p>
              <p className="text-sm text-gray-600">
                Availability:{' '}
                <span className="font-medium">{personnel?.isAvailable ? 'available' : 'unavailable'}</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Zones</p>
              {Array.isArray(personnel?.zones) && personnel.zones.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {personnel.zones.map((z) => (
                    <span key={z._id} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {z?.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">—</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              max={endDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              min={startDate}
              max={moment().format('YYYY-MM-DD')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate(moment().subtract(1, 'month').format('YYYY-MM-DD'));
                setEndDate(moment().format('YYYY-MM-DD'));
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Assigned Orders" value={stats?.totalAssignedOrders ?? 0} />
          <StatCard title="Total Assigned Items" value={stats?.totalAssignedItems ?? 0} />
          <StatCard
            title="Total Expected Earnings"
            value={stats?.totalExpectedEarnings ? numberFormatter(stats.totalExpectedEarnings) : '₦0'}
          />
          <StatCard title="Ready Orders" value={orderStatusCounts?.ready ?? 0} />
          <StatCard title="Picked Up Items" value={itemStatusCounts?.picked_up ?? 0} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{data?.totalData ?? 0}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex items-center gap-2 justify-center">
            <ImSpinner2 className="animate-spin" size={20} />
            <p className="text-sm font-medium text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 flex flex-col justify-center items-center">
            <img className="w-32" src={empty} alt="no data" />
            <p className="font-medium text-gray-500 mt-2">No orders found</p>
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
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Delivery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((o) => (
                    <tr
                      key={o._id}
                      onClick={() => showOrderDetail(o)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{o.orderNumber || o._id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{o.businessName || '—'}</div>
                        <div className="text-xs text-gray-500">{o.businessId || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {o.orderDate ? moment(o.orderDate).format('MMM DD, YYYY HH:mm') : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {o.expectedDeliveryDate ? moment(o.expectedDeliveryDate).format('MMM DD, YYYY HH:mm') : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {o.totalAmount ? numberFormatter(o.totalAmount) : '₦0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {o.totalDeliveryFee ? numberFormatter(o.totalDeliveryFee) : '₦0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Array.isArray(o.assignedItems) ? (
                          <div>
                            <span className="text-gray-500"> {o.totalItems || 0}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(o.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 capitalize">
                          {o?.deliveryInfo?.status ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {!isOrderCompleted(o) ? (
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              const v = e.target.value;
                              e.target.value = '';
                              if (v === 'completed' && canMarkAsCompleted(o)) {
                                markAsCompleted(o._id);
                              } else if (v === 'completed' && !canMarkAsCompleted(o)) {
                                customToast('Order must be delivered before marking as completed', true);
                              }
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            disabled={!canMarkAsCompleted(o)}
                            title={!canMarkAsCompleted(o) ? 'Order must be delivered before marking as completed' : ''}
                          >
                            <option value="">Actions</option>
                            <option value="completed" disabled={!canMarkAsCompleted(o)}>
                              Mark as Completed
                            </option>
                          </select>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                            completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data?.totalPage > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * perPage, data?.totalData || 0)}</span> of{' '}
                  <span className="font-medium">{data?.totalData || 0}</span> results
                </div>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Next"
                  previousLabel="Previous"
                  onPageChange={handlePageChange}
                  pageRangeDisplayed={5}
                  pageCount={data?.totalPage || 1}
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
              <div className="flex items-center gap-2">
                {orderDetail && !isOrderCompleted(orderDetail) ? (
                  <button
                    onClick={() => markAsCompleted(orderDetail?._id)}
                    disabled={markingDelivered || !canMarkAsCompleted(orderDetail)}
                    className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    title={
                      !canMarkAsCompleted(orderDetail) ? 'Order must be delivered before marking as completed' : ''
                    }
                  >
                    {markingDelivered ? <ImSpinner2 className="animate-spin" size={16} /> : null}
                    Mark as Completed
                  </button>
                ) : orderDetail ? (
                  <span className="px-3 py-2 bg-green-100 text-green-800 text-sm rounded-lg font-semibold">
                    Completed
                  </span>
                ) : null}
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {orderDetail ? (
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

                {/* Assigned Items */}
                {orderDetail.assignedItems && orderDetail.assignedItems.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Assigned Items</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bakery</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Quantity
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Delivery Fee
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Assigned At
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Picked Up At
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Delivered At
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Proof of Delivery
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orderDetail.assignedItems.map((item, idx) => {
                            const proofOfDelivery = getProofOfDelivery(orderDetail, item.productId);
                            const isDelivered = item.status === 'delivered' || !!proofOfDelivery;

                            return (
                              <tr key={item._id || idx}>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.productName || 'N/A'}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.bakeryName || 'N/A'}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {item.quantity} {item.unit || ''}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {item.totalDeliveryFee ? numberFormatter(item.totalDeliveryFee) : '₦0'}
                                  {item.deliveryFee && (
                                    <span className="text-xs text-gray-500 block">
                                      ({numberFormatter(item.deliveryFee)} × {item.quantity})
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <span
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                      isDelivered
                                        ? 'bg-green-100 text-green-800'
                                        : item.status === 'picked_up'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : item.status === 'assigned'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {isDelivered ? 'delivered' : item.status || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {item.assignedAt ? moment(item.assignedAt).format('MMM DD, YYYY HH:mm') : '—'}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {item.pickedUpAt ? moment(item.pickedUpAt).format('MMM DD, YYYY HH:mm') : '—'}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {item.deliveredAt ? moment(item.deliveredAt).format('MMM DD, YYYY HH:mm') : '—'}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {proofOfDelivery ? (
                                    <div className="space-y-1 max-w-xs">
                                      {proofOfDelivery.photo && (
                                        <a
                                          href={proofOfDelivery.photo}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-indigo-600 hover:text-indigo-800 text-xs underline block"
                                        >
                                          View Photo
                                        </a>
                                      )}
                                      {proofOfDelivery.receivedBy && (
                                        <p className="text-xs text-gray-600">
                                          Received by: {proofOfDelivery.receivedBy}
                                        </p>
                                      )}
                                      {proofOfDelivery.notes && (
                                        <p className="text-xs text-gray-500 italic">Note: {proofOfDelivery.notes}</p>
                                      )}
                                      {proofOfDelivery.timestamp && (
                                        <p className="text-xs text-gray-500">
                                          {moment(proofOfDelivery.timestamp).format('MMM DD, YYYY HH:mm')}
                                        </p>
                                      )}
                                      {proofOfDelivery.isSigned && (
                                        <span className="text-xs text-green-600 font-semibold">✓ Signed</span>
                                      )}
                                    </div>
                                  ) : (
                                    '—'
                                  )}
                                </td>
                              </tr>
                            );
                          })}
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
                        {orderDetail.totalDeliveryFee
                          ? numberFormatter(orderDetail.totalDeliveryFee)
                          : orderDetail.deliveryFee
                          ? numberFormatter(orderDetail.deliveryFee)
                          : '₦0'}
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
