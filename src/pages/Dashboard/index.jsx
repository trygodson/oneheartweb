import React, { useState, useEffect, useContext } from 'react';
import { AdminDashboard } from './AdminDashboard';

export function Dashboard() {
  return (
    // <AppLayoutNew noHeader={loading}>
    <AdminDashboard userId={null} />
  );
}
