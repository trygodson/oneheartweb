import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ImSpinner2 } from 'react-icons/im';
import { FiArrowLeft, FiX, FiMoreVertical } from 'react-icons/fi';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import {
  GetBakeriesDetailsService,
  GetBakeriesProductsService,
  GetBakeriesOrdersStatisticsAllTimeService,
  GetBakeriesOrdersStatisticsDailyService,
  ApproveBakeryByIdService,
  RejectBakeryByIdService,
  SuspendBakeryByIdService,
  ReactivateSuspendedBakeryByIdService,
} from '../../services/bakeriesService';
import {
  ActivateProductService,
  DeactivateProductService,
  SetProductPriceService,
} from '../../services/productService';
import { numberFormatter } from '../../utils/helper';
import customToast from '../../components/Toast/toastify';

export function BakeryDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const bakeryId = location.state?.id || location.pathname.split('/').pop();

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [bakery, setBakery] = useState(null);
  const [products, setProducts] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [dailyStatistics, setDailyStatistics] = useState(null);
  const [dailyStatsLoading, setDailyStatsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [modalState, setModalState] = useState({ isOpen: false, action: null, title: '', message: '' });
  const [priceModal, setPriceModal] = useState({ isOpen: false, product: null });
  const [activateModal, setActivateModal] = useState({ isOpen: false, product: null, action: null });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [priceFormData, setPriceFormData] = useState({
    productId: '',
    shopPrice: '',
    bakeryPrice: '',
    platformNotes: '',
  });
  const [productActionLoading, setProductActionLoading] = useState(false);
  const dropdownRefs = useRef({});

  useEffect(() => {
    if (bakeryId) {
      fetchBakeryDetails();
      fetchProducts();
      fetchStatistics();
      fetchDailyStatistics(selectedDate);
    }
  }, [bakeryId]);

  useEffect(() => {
    if (bakeryId && selectedDate) {
      fetchDailyStatistics(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (bakeryId) {
      fetchProducts();
    }
  }, [currentPage]);

  const fetchBakeryDetails = async () => {
    try {
      setLoading(true);
      const response = await GetBakeriesDetailsService(bakeryId);
      if (response?.data?.success) {
        setBakery(response.data.data);
      } else if (response?.success) {
        setBakery(response.data);
      }
    } catch (error) {
      console.error('Error fetching bakery details:', error);
      customToast(error?.message || 'Failed to fetch bakery details', true);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await GetBakeriesProductsService({ id: bakeryId, page: currentPage, limit: perPage });
      if (response?.data?.success) {
        setProducts(response.data.data || []);
        setTotalPages(response.data.totalPage || 1);
        setTotalData(response.data.totalData || 0);
        setPerPage(response.data.perPage || 10);
      } else if (response?.success) {
        setProducts(response.data || []);
        setTotalPages(response.totalPage || 1);
        setTotalData(response.totalData || 0);
        setPerPage(response.perPage || 10);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      customToast(error?.message || 'Failed to fetch products', true);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await GetBakeriesOrdersStatisticsAllTimeService(bakeryId);
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

  const fetchDailyStatistics = async (date = selectedDate) => {
    try {
      setDailyStatsLoading(true);
      const response = await GetBakeriesOrdersStatisticsDailyService(bakeryId, date);
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

  const openModal = (action, title, message) => {
    setModalState({ isOpen: true, action, title, message });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, action: null, title: '', message: '' });
  };

  const handleAction = async () => {
    try {
      setActionLoading(true);
      let response;
      switch (modalState.action) {
        case 'approve':
          response = await ApproveBakeryByIdService(bakeryId);
          break;
        case 'reject':
          response = await RejectBakeryByIdService(bakeryId);
          break;
        case 'suspend':
          response = await SuspendBakeryByIdService(bakeryId);
          break;
        case 'reactivate':
          response = await ReactivateSuspendedBakeryByIdService(bakeryId);
          break;
        default:
          return;
      }

      if (response?.data?.success || response?.success) {
        const message = response?.data?.message || response?.message || 'Action completed successfully';
        customToast(message);
        closeModal();
        fetchBakeryDetails();
      } else {
        const message = response?.data?.message || response?.message || 'Action failed';
        customToast(message, true);
      }
    } catch (error) {
      console.error('Error performing action:', error);
      customToast(error?.message || 'Action failed', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPriceModal = (product) => {
    setOpenDropdownId(null);
    setPriceFormData({
      productId: product._id,
      shopPrice: product.price || '',
      bakeryPrice: product.adminBakeryPrice || product.price || '',
      platformNotes: '',
    });
    // Use requestAnimationFrame to ensure state updates after dropdown closes
    requestAnimationFrame(() => {
      setPriceModal({ isOpen: true, product });
    });
  };

  const handleClosePriceModal = () => {
    setPriceModal({ isOpen: false, product: null });
    setPriceFormData({
      productId: '',
      shopPrice: '',
      bakeryPrice: '',
      platformNotes: '',
    });
  };

  const handleSubmitPrice = async () => {
    try {
      setProductActionLoading(true);
      const response = await SetProductPriceService(priceFormData);
      if (response?.data?.success || response?.success) {
        const message = response?.data?.message || response?.message || 'Price updated successfully';
        customToast(message);
        handleClosePriceModal();
        fetchProducts();
      } else {
        const message = response?.data?.message || response?.message || 'Failed to update price';
        customToast(message, true);
      }
    } catch (error) {
      console.error('Error updating price:', error);
      customToast(error?.message || 'Failed to update price', true);
    } finally {
      setProductActionLoading(false);
    }
  };

  const handleOpenActivateModal = (product, action) => {
    setOpenDropdownId(null);
    // Use requestAnimationFrame to ensure state updates after dropdown closes
    requestAnimationFrame(() => {
      setActivateModal({ isOpen: true, product, action });
    });
  };

  const handleCloseActivateModal = () => {
    setActivateModal({ isOpen: false, product: null, action: null });
  };

  const handleActivateDeactivate = async () => {
    try {
      setProductActionLoading(true);
      let response;
      if (activateModal.action === 'activate') {
        response = await ActivateProductService(activateModal.product._id);
      } else {
        response = await DeactivateProductService(activateModal.product._id);
      }

      if (response?.data?.success || response?.success) {
        const message = response?.data?.message || response?.message || `Product ${activateModal.action}d successfully`;
        customToast(message);
        handleCloseActivateModal();
        fetchProducts();
      } else {
        const message = response?.data?.message || response?.message || 'Action failed';
        customToast(message, true);
      }
    } catch (error) {
      console.error('Error performing product action:', error);
      customToast(error?.message || 'Action failed', true);
    } finally {
      setProductActionLoading(false);
    }
  };

  const toggleDropdown = (productId, e) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === productId ? null : productId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close dropdown if clicking on modal or modal buttons
      const isModalClick = event.target.closest('[data-modal]') || event.target.closest('[data-modal-backdrop]');
      if (isModalClick) {
        return;
      }
      // Don't close if clicking on dropdown menu items (they will handle their own clicks)
      const isDropdownClick = event.target.closest('[data-dropdown-menu]');
      if (isDropdownClick) {
        return;
      }
      Object.keys(dropdownRefs.current).forEach((key) => {
        if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
          setOpenDropdownId(null);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800',
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
        <p className="text-sm font-medium text-gray-600">Loading bakery details...</p>
      </div>
    );
  }

  if (!bakery) {
    return (
      <div className="py-20 flex flex-col justify-center items-center">
        <p className="font-medium text-gray-500 mb-4">Bakery not found</p>
        <button
          onClick={() => navigate('/app/bakeries')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Back to Bakeries
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/app/bakeries')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{bakery.bakeryName}</h1>
          <p className="text-sm text-gray-500">Bakery Details</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {!bakery.isApproved && (
          <button
            onClick={() => openModal('approve', 'Approve Bakery', 'Are you sure you want to approve this bakery?')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Approve Bakery
          </button>
        )}
        {!bakery.isApproved && (
          <button
            onClick={() =>
              openModal(
                'reject',
                'Reject Bakery',
                'Are you sure you want to reject this bakery? This action cannot be undone.',
              )
            }
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reject Bakery
          </button>
        )}
        {bakery.status === 'active' && (
          <button
            onClick={() => openModal('suspend', 'Suspend Bakery', 'Are you sure you want to suspend this bakery?')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Suspend Bakery
          </button>
        )}
        {bakery.status === 'suspended' && (
          <button
            onClick={() =>
              openModal('reactivate', 'Reactivate Bakery', 'Are you sure you want to reactivate this bakery?')
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reactivate Bakery
          </button>
        )}
        <button
          onClick={() =>
            navigate(`/app/bakeries/${bakeryId}/orders`, { state: { bakeryId, bakeryName: bakery.bakeryName } })
          }
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          View All Orders
        </button>
      </div>

      {/* Bakery Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <img
              src={bakery.logo || 'https://via.placeholder.com/100'}
              alt={bakery.bakeryName}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{bakery.bakeryName}</h2>
              <p className="text-sm text-gray-600 mb-4">{bakery.description || 'No description'}</p>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(bakery.status)}
                {bakery.isApproved ? (
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Approved
                  </span>
                ) : (
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending Approval
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Address</p>
              <p className="text-sm text-gray-900">
                {bakery.address?.street || 'N/A'}
                <br />
                {bakery.address?.city}, {bakery.address?.state} {bakery.address?.postalCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-sm text-gray-900">{bakery.user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Created</p>
              <p className="text-sm text-gray-900">{moment(bakery.createdAt).format('MMM DD, YYYY')}</p>
            </div>
            {bakery.metrics && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Metrics</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-900">
                    <strong>{bakery.metrics.productsCount || 0}</strong> Products
                  </span>
                  <span className="text-gray-900">
                    <strong>{bakery.metrics.ordersCount || 0}</strong> Orders
                  </span>
                  {bakery.metrics.rating && (
                    <span className="text-gray-900">
                      <strong>{bakery.metrics.rating.average || 0}</strong> Rating (
                      {bakery.metrics.rating.totalReviews || 0} reviews)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards - All Time */}
      {statistics && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Statistics (All Time)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Orders" value={statistics.totalOrders || 0} isLoading={statsLoading} />
            <StatCard
              title="Total Revenue"
              value={statistics.totalRevenue ? numberFormatter(statistics.totalRevenue) : '₦0'}
              isLoading={statsLoading}
            />
            <StatCard
              title="Bakery Earnings"
              value={statistics.totalBakeryEarnings ? numberFormatter(statistics.totalBakeryEarnings) : '₦0'}
              isLoading={statsLoading}
            />
            <StatCard
              title="Platform Commission"
              value={statistics.totalPlatformCommission ? numberFormatter(statistics.totalPlatformCommission) : '₦0'}
              isLoading={statsLoading}
            />
            <StatCard title="Total Ordered Items" value={statistics.totalItems || 0} isLoading={statsLoading} />
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

      {/* Daily Statistics Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Daily Statistics ({moment(selectedDate).format('MMM DD, YYYY')})
          </h2>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              max={moment().format('YYYY-MM-DD')}
            />
          </div>
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
            {dailyStatsLoading ? (
              <>
                <ImSpinner2 className="animate-spin" size={24} />
                <p className="ml-2 text-sm font-medium text-gray-600">Loading daily statistics...</p>
              </>
            ) : (
              <p className="text-sm font-medium text-gray-500">No statistics available for this date</p>
            )}
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Products</h2>
        </div>

        {productsLoading ? (
          <div className="py-24 flex items-center gap-2 justify-center">
            <ImSpinner2 className="animate-spin" size={20} />
            <p className="text-sm font-medium text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 flex flex-col justify-center items-center">
            <p className="font-medium text-gray-500">No products found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bakery Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/50'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            {product.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.price ? numberFormatter(product.price) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.price ? numberFormatter(product.adminBakeryPrice) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="text-xs text-gray-500 truncate max-w-xs">{product?.categoryId?.name ?? ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(product.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.isAvailable ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.maximumDailyCapacity || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                        <div className="relative" ref={(el) => (dropdownRefs.current[product._id] = el)}>
                          <button
                            onClick={(e) => toggleDropdown(product._id, e)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <FiMoreVertical size={18} />
                          </button>
                          {openDropdownId === product._id && (
                            <div
                              data-dropdown-menu
                              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenPriceModal(product);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Change Price
                                </button>
                                {product.isAvailable ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenActivateModal(product, 'deactivate');
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Deactivate Product
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenActivateModal(product, 'activate');
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Activate Product
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
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

      {/* Confirmation Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black/60 overflow-hidden grid place-content-center z-[10001]">
          <div className="bg-white rounded-xl p-6 min-w-[400px] max-w-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{modalState.title}</h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={actionLoading}
              >
                <FiX size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">{modalState.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                  modalState.action === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : modalState.action === 'suspend'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionLoading && <ImSpinner2 className="animate-spin" size={16} />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Price Modal */}
      {priceModal.isOpen && (
        <div
          data-modal-backdrop
          className="fixed inset-0 bg-black/60 overflow-hidden grid place-content-center z-[10001]"
          onClick={handleClosePriceModal}
        >
          <div
            data-modal
            className="bg-white rounded-xl p-6 min-w-[500px] max-w-[600px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Product Price</h3>
              <button
                onClick={handleClosePriceModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={productActionLoading}
              >
                <FiX size={20} />
              </button>
            </div>
            {priceModal.product && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{priceModal.product.name}</p>
                <p className="text-xs text-gray-500">{priceModal.product.description || 'No description'}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Price (₦)</label>
                <input
                  type="number"
                  value={priceFormData.shopPrice}
                  onChange={(e) => setPriceFormData({ ...priceFormData, shopPrice: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter shop price"
                  disabled={productActionLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bakery Price (₦)</label>
                <input
                  type="number"
                  value={priceFormData.bakeryPrice}
                  onChange={(e) => setPriceFormData({ ...priceFormData, bakeryPrice: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter bakery price"
                  disabled={productActionLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Notes</label>
                <textarea
                  value={priceFormData.platformNotes}
                  onChange={(e) => setPriceFormData({ ...priceFormData, platformNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter platform notes (optional)"
                  rows={3}
                  disabled={productActionLoading}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={handleClosePriceModal}
                disabled={productActionLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPrice}
                disabled={productActionLoading || !priceFormData.shopPrice || !priceFormData.bakeryPrice}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {productActionLoading && <ImSpinner2 className="animate-spin" size={16} />}
                Update Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate/Deactivate Confirmation Modal */}
      {activateModal.isOpen && (
        <div
          data-modal-backdrop
          className="fixed inset-0 bg-black/60 overflow-hidden grid place-content-center z-[10001]"
          onClick={handleCloseActivateModal}
        >
          <div
            data-modal
            className="bg-white rounded-xl p-6 min-w-[400px] max-w-[500px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {activateModal.action === 'activate' ? 'Activate Product' : 'Deactivate Product'}
              </h3>
              <button
                onClick={handleCloseActivateModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={productActionLoading}
              >
                <FiX size={20} />
              </button>
            </div>
            {activateModal.product && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{activateModal.product.name}</p>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to {activateModal.action === 'activate' ? 'activate' : 'deactivate'} this product?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseActivateModal}
                disabled={productActionLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleActivateDeactivate}
                disabled={productActionLoading}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                  activateModal.action === 'activate'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {productActionLoading && <ImSpinner2 className="animate-spin" size={16} />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
