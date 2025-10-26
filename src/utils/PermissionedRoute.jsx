import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/authContext';
import { NotFound } from '../layout/NotFound';

const PermissionedRoute = ({ children, permissions }) => {
  // const { userData } = useAuthContext();

  // // If no permissions are defined, allow access
  // if (!permissions || permissions.length === 0) {
  //   return children;
  // }

  // // If user data or role_id is not available yet, you might want to show a loading state
  // if (!userData || !userData.role_id) {
  //   return children; // or return a loading component
  // }

  // // Check if user's role_id is in the allowed permissions
  // const hasPermission = permissions.includes(userData.role_id);

  // if (!hasPermission) {
  //   return <NotFound />;
  // }

  return children;
};

export default PermissionedRoute;
