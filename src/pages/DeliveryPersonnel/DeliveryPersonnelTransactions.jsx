import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImSpinner2 } from 'react-icons/im';
import { MdRefresh } from 'react-icons/md';
import { FiX } from 'react-icons/fi';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import {
  getDeliveryPersonelWalletTransactionsService,
  getDeliveryPersonelTransactionsStatsService,
  createADeliveryPersonelWalletTransactionsService,
  requestAuthCodeForDeliveryPersonelWalletTransactionsService,
} from '../../services/deliveryPersonelService';
import { UploadImageService } from '../../services/imageService';
import { numberFormatter } from '../../utils/helper';
import empty from '../../assets/images/undraw_no-data.png';
import customToast from '../../components/Toast/toastify';

export function DeliveryPersonnelTransactions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);
  const [startDate, setStartDate] = useState(moment().subtract(1, 'month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestingOTP, setRequestingOTP] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    type: '2', // 1 = debit, 2 = credit
    category: 'DELIVERY_FEE',
    balanceType: 'DEPOSIT',
    amount: '',
    description: '',
    reference: '', // image URL
    authMethod: 'EMAIL_OTP',
    authCode: '',
    metadata: {},
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getDeliveryPersonelWalletTransactionsService({
        personnelId: id,
        page,
        limit: perPage,
        startDate: startDate || null,
        endDate: endDate || null,
      });
      const payload = res?.data?.success ? res.data : res;
      if (payload?.success) setData(payload);
      else setData(null);
    } catch (e) {
      console.error('Error fetching transactions:', e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      // Stats default to null/null for all-time stats
      const res = await getDeliveryPersonelTransactionsStatsService({
        personnelId: id,
        startDate: null,
        endDate: null,
      });
      const payload = res?.data?.success ? res.data : res;
      if (payload?.success) setStats(payload?.data || null);
      else setStats(null);
    } catch (e) {
      console.error('Error fetching stats:', e);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchTransactions(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentPage, startDate, endDate]);

  useEffect(() => {
    if (!id) return;
    // Stats are fetched once on mount and when id changes (all-time stats)
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchTransactions(1);
    // Stats refresh also uses all-time (null dates)
    fetchStats();
  };

  const handlePageChange = (pageIndex) => {
    setCurrentPage(pageIndex.selected + 1);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRequestOTP = async () => {
    try {
      if (!formData.authMethod) {
        customToast('Please select an authentication method', true);
        return;
      }
      setRequestingOTP(true);
      const res = await requestAuthCodeForDeliveryPersonelWalletTransactionsService({
        personnelId: id,
        data: { authMethod: formData.authMethod },
      });
      const ok = res?.data?.success || res?.success;
      if (ok) {
        customToast('OTP sent successfully. Please check your email.');
      } else {
        customToast(res?.data?.message || res?.message || 'Failed to send OTP', true);
      }
    } catch (e) {
      console.error('Error requesting OTP:', e);
      customToast(e?.message || 'Failed to send OTP', true);
    } finally {
      setRequestingOTP(false);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      customToast('Please select an image file', true);
      return;
    }
    try {
      setUploadingImage(true);
      const imageUrl = await UploadImageService(imageFile);
      setFormData((prev) => ({ ...prev, reference: imageUrl }));
      customToast('Image uploaded successfully');
      return imageUrl;
    } catch (e) {
      console.error('Error uploading image:', e);
      customToast(e?.message || 'Failed to upload image', true);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        customToast('Please enter a valid amount', true);
        return;
      }
      if (!formData.description) {
        customToast('Please enter a description', true);
        return;
      }
      if (!formData.reference) {
        customToast('Please upload a proof of payment image', true);
        return;
      }
      if (!formData.authCode) {
        customToast('Please enter the OTP code', true);
        return;
      }

      setSubmitting(true);

      // Upload image if not already uploaded
      let referenceUrl = formData.reference;
      if (imageFile && !referenceUrl) {
        referenceUrl = await handleUploadImage();
        if (!referenceUrl) {
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        deliveryPersonnelId: id,
        type: parseInt(formData.type),
        category: formData.category,
        balanceType: formData.balanceType,
        amount: parseFloat(formData.amount),
        description: formData.description,
        reference: referenceUrl,
        metadata: formData.metadata || {},
        authMethod: formData.authMethod,
        authCode: formData.authCode,
      };

      const res = await createADeliveryPersonelWalletTransactionsService({
        personnelId: id,
        data: payload,
      });

      const ok = res?.data?.success || res?.success;
      if (ok) {
        customToast('Transaction created successfully');
        setModalOpen(false);
        // Reset form
        setFormData({
          type: '2',
          category: 'DELIVERY_FEE',
          balanceType: 'DEPOSIT',
          amount: '',
          description: '',
          reference: '',
          authMethod: 'EMAIL_OTP',
          authCode: '',
          metadata: {},
        });
        setImageFile(null);
        setImagePreview(null);
        // Refresh data
        fetchTransactions(currentPage);
        fetchStats();
      } else {
        customToast(res?.data?.message || res?.message || 'Failed to create transaction', true);
      }
    } catch (e) {
      console.error('Error creating transaction:', e);
      customToast(e?.message || 'Failed to create transaction', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({
      type: '2',
      category: 'DELIVERY_FEE',
      balanceType: 'DEPOSIT',
      amount: '',
      description: '',
      reference: '',
      authMethod: 'EMAIL_OTP',
      authCode: '',
      metadata: {},
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const transactions = data?.data || [];
  const personnel = data?.deliveryPersonnel || null;

  const personName = personnel?.user
    ? `${personnel.user.firstName || ''} ${personnel.user.lastName || ''}`.trim() || 'Delivery Personnel'
    : 'Delivery Personnel';

  const getStatusBadge = (status) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
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

  const getTypeBadge = (type) => {
    // type "1" = credit, "2" = debit
    const isCredit = String(type) === '2';
    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          isCredit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {isCredit ? 'Credit' : 'Debit'}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    return (
      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
        {category || 'N/A'}
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-600 hover:text-gray-900 mb-2">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{personName} — Transactions</h1>
          <p className="text-sm text-gray-500">Wallet transactions and earnings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            Create Transaction
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

      {/* Stats Cards */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Transactions" value={stats?.totalTransactions ?? 0} isLoading={statsLoading} />
          <StatCard
            title="Total Amount"
            value={stats?.totalAmount ? numberFormatter(stats.totalAmount) : '₦0'}
            isLoading={statsLoading}
          />
          <StatCard
            title="Total Credits"
            value={stats?.totalCredits ? numberFormatter(stats.totalCredits) : '₦0'}
            isLoading={statsLoading}
          />
          <StatCard
            title="Total Debits"
            value={stats?.totalDebits ? numberFormatter(stats.totalDebits) : '₦0'}
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* Filters */}
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

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{data?.totalData ?? 0}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex items-center gap-2 justify-center">
            <ImSpinner2 className="animate-spin" size={20} />
            <p className="text-sm font-medium text-gray-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 flex flex-col justify-center items-center">
            <img className="w-32" src={empty} alt="no data" />
            <p className="font-medium text-gray-500 mt-2">No transactions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Ref
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{tx.transactionRef || '—'}</div>
                        <div className="text-xs text-gray-500">{tx._id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getTypeBadge(tx.type)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getCategoryBadge(tx.category)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {tx.amount ? numberFormatter(tx.amount) : '₦0'}
                        </div>
                        {tx.metadata?.orderNumber && (
                          <div className="text-xs text-gray-500">{tx.metadata.orderNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(tx.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">{tx.balanceType || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{tx.description || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{tx.reference || '—'}</div>
                        {tx.metadata?.orderId && <div className="text-xs text-gray-500">{tx.metadata.orderId}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.completedAt ? moment(tx.completedAt).format('MMM DD, YYYY HH:mm') : '—'}
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

      {/* Right Sidebar Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[10000] transition-opacity" onClick={handleCloseModal} />
          <div
            className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-[10001] transform transition-transform duration-300 ease-in-out overflow-y-auto`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create Transaction</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1">Debit</option>
                    <option value="2">Credit</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DELIVERY_FEE">Delivery Fee</option>
                    {/* <option value="BONUS">Bonus</option> */}
                  </select>
                </div>

                {/* Balance Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Balance Type *</label>
                  <select
                    value={formData.balanceType}
                    onChange={(e) => handleInputChange('balanceType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DEPOSIT">Deposit</option>
                    <option value="WITHDRAWABLE">Withdrawable</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter transaction description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proof of Payment *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="max-w-full h-32 object-cover rounded-lg" />
                      {formData.reference && <p className="text-xs text-green-600 mt-1">✓ Image uploaded</p>}
                    </div>
                  )}
                  {imageFile && !formData.reference && (
                    <button
                      onClick={handleUploadImage}
                      disabled={uploadingImage}
                      className="mt-2 px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {uploadingImage ? (
                        <>
                          <ImSpinner2 className="animate-spin" size={14} />
                          Uploading...
                        </>
                      ) : (
                        'Upload Image'
                      )}
                    </button>
                  )}
                </div>

                {/* Auth Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Authentication Method *</label>
                  <select
                    value={formData.authMethod}
                    onChange={(e) => handleInputChange('authMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="EMAIL_OTP">Email OTP</option>
                    <option value="GOOGLE_AUTH">Google Authenticator</option>
                  </select>
                </div>

                {/* OTP Request & Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OTP Code *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.authCode}
                      onChange={(e) => handleInputChange('authCode', e.target.value)}
                      placeholder="Enter OTP code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleRequestOTP}
                      disabled={requestingOTP}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    >
                      {requestingOTP ? (
                        <>
                          <ImSpinner2 className="animate-spin" size={14} />
                          Sending...
                        </>
                      ) : (
                        'Request OTP'
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <ImSpinner2 className="animate-spin" size={16} />
                        Creating...
                      </>
                    ) : (
                      'Create Transaction'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
