import React, { useState, useEffect, useContext } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import PageLoading from '../../components/Loaders/PageLoading';
import { useNavigate, useNavigation } from 'react-router-dom';

export function AdminDashboard({ userId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  return (
    // <AppLayoutNew noHeader={loading}>
    <>{loading ? <PageLoading msg={'Fetching Home..'} /> : <></>}</>
  );
}
