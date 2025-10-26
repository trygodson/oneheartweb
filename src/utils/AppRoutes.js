import { NotFound } from '../layout/NotFound';
import { Dashboard } from '../pages';
import { KYCList, KYCDetails } from '../pages/KYC';
import { userPermissions } from './userPermissions';

export const AppRoutes = [
  {
    title: 'Home',
    path: '',
    component: Dashboard,
    header: true,
    permissions: [...Object.values(userPermissions).map((r) => r)],
  },
  {
    title: 'Home',
    path: 'home',
    component: Dashboard,
    header: true,
    permissions: [...Object.values(userPermissions).map((r) => r)],
  },
  {
    title: 'KYC Management',
    path: 'kyc',
    component: KYCList,
    header: true,
    permissions: [...Object.values(userPermissions).map((r) => r)],
  },
  {
    title: 'KYC Details',
    path: 'kyc/:id',
    component: KYCDetails,
    header: true,
    permissions: [...Object.values(userPermissions).map((r) => r)],
  },
];
