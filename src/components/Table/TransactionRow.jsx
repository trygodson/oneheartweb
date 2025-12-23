import React, { useState, useEffect } from 'react';
import { ApproveMerchantTrxService, UpdateMerchantTrxService } from '../../services/kycService';
import { toast } from 'react-toastify';
import { FaEdit } from 'react-icons/fa';

const TransactionRow = ({ transaction, onApprove, onViewImage }) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [amountValue, setAmountValue] = useState(transaction.amount || '');

  useEffect(() => {
    if (!isEditing) {
      setAmountValue(transaction.amount || '');
    }
  }, [transaction.amount, isEditing]);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const response = await ApproveMerchantTrxService({ id: transaction.id });
      if (response?.success) {
        toast.success(response?.message || 'Transaction approved successfully');
        onApprove();
      } else {
        toast.error('Failed to approve transaction');
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast.error(error?.message || 'Failed to approve transaction');
    } finally {
      setIsApproving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setAmountValue(transaction.amount || '');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAmountValue(transaction.amount || '');
  };

  const handleUpdate = async () => {
    const amount = parseFloat(amountValue);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await UpdateMerchantTrxService({ id: transaction.id, amount: amountValue });
      if (response?.success) {
        toast.success(response?.message || 'Transaction amount updated successfully');
        setIsEditing(false);
        onApprove(); // Refresh the transaction list
      } else {
        toast.error('Failed to update transaction amount');
      }
    } catch (error) {
      console.error('Error updating transaction amount:', error);
      toast.error(error?.message || 'Failed to update transaction amount');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return 'N/A';
    return `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      SUCCESS: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    return (
      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
        {type}
      </span>
    );
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getTypeBadge(transaction.transactionType)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {getStatusBadge(transaction.transactionStatus)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={amountValue}
              onChange={(e) => setAmountValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isUpdating) {
                  handleUpdate();
                } else if (e.key === 'Escape' && !isUpdating) {
                  handleCancel();
                }
              }}
              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Amount"
              disabled={isUpdating}
              autoFocus
            />
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-2 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              title="Save"
            >
              {isUpdating ? '...' : '✓'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="px-2 py-1 text-xs font-medium text-white bg-gray-500 rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title="Cancel"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>{formatAmount(transaction.amount)}</span>
            {transaction.proofOfPayment && (
              <button
                onClick={handleEdit}
                className="ml-2 text-indigo-600 hover:text-indigo-900 font-medium text-xs"
                title="Edit amount"
              >
                <FaEdit size={16} />
              </button>
            )}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{transaction.reference || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(transaction.createdAt)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {transaction.proofOfPayment ? (
          <button
            onClick={() => onViewImage(transaction.proofOfPayment)}
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            View Proof
          </button>
        ) : (
          <span className="text-gray-400">No proof</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {transaction.transactionStatus !== 'SUCCESS' && (
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {isApproving ? 'Approving...' : 'Approve'}
          </button>
        )}
      </td>
    </tr>
  );
};

export default TransactionRow;
