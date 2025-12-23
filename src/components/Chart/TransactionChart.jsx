import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const TransactionChart = ({ height, data = [], timeRange }) => {
  const formatData = () => {
    if (!data || data.length === 0) return [];

    // Group transactions by date
    const groupedData = data.reduce((acc, transaction) => {
      const date = moment(transaction.createdAt).format('MMM DD');

      if (!acc[date]) {
        acc[date] = {
          pending: 0,
          approved: 0,
        };
      }

      if (transaction.transactionStatus === 'PENDING') {
        acc[date].pending += parseFloat(transaction.amount);
      } else if (transaction.transactionStatus === 'SUCCESS') {
        acc[date].approved += parseFloat(transaction.amount);
      }

      return acc;
    }, {});

    // Convert grouped data to array format required by recharts
    return Object.keys(groupedData).map((date) => ({
      name: date,
      pending: groupedData[date].pending,
      approved: groupedData[date].approved,
      total: groupedData[date].pending + groupedData[date].approved,
    }));
  };

  const formattedData = formatData();

  return (
    <ResponsiveContainer width="100%" height={height || 300}>
      <AreaChart data={formattedData}>
        <XAxis dataKey="name" fontSize={'10px'} axisLine={{ stroke: '#f0f0f0' }} />
        <YAxis fontSize={'10px'} axisLine={{ stroke: '#f0f0f0' }} tickFormatter={(value) => `$${value}`} />
        <Tooltip formatter={(value) => [`$${value}`, '']} labelFormatter={(label) => `Date: ${label}`} />
        <defs>
          <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FFB547" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#FFB547" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#36B37E" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#36B37E" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4C9AFF" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#4C9AFF" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="total" stroke="#4C9AFF" fill="url(#colorTotal)" strokeWidth={2} />
        <Area type="monotone" dataKey="approved" stroke="#36B37E" fill="url(#colorApproved)" strokeWidth={2} />
        <Area type="monotone" dataKey="pending" stroke="#FFB547" fill="url(#colorPending)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TransactionChart;
