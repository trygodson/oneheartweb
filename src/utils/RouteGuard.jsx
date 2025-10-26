import { Navigate, Outlet, Route, redirect } from 'react-router-dom';
import { GET_STORAGE_ITEM } from '../config/storage';
import { useAuthContext } from '../context/authContext';
import { AppLayoutNew } from '../layout/AppLayoutNew';

const RouteGuard = ({ who = ['user'], ...props }) => {
  // const { userData } = useAuthContext();
  const token = GET_STORAGE_ITEM('token');
  // console.log(token, '====token====');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayoutNew>
      <Outlet />
    </AppLayoutNew>
  );
};

function Loading({ logo = false, children }) {
  return <main className="section h-screen w-screen flex justify-center items-center">Loading...</main>;
}

export { RouteGuard, Loading };
