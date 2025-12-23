// export const BASE_URL = 'https://4fc7-197-210-53-66.ngrok-free.app';
// export const BASE_URL = 'https://admin-bbservice.onrender.com';
export const BASE_URL = 'http://localhost:3013';

export const ApiEndPoints = {
  //AUTH
  LOGIN: '/auth/login',
  UPLOAD_IMAGE: '/auth/upload',

  BAKERIES: '/bakeries',
  BAKERIES_STATISTICS: '/bakeries/statistics/overall',
  // BREADS: '/breads',
  // TRX: '/trx',

  ADMIN_BAKERY_PRODUCT: '/admin-bakery-products',

  SHOPS: '/shops',
  DELIVERY_ZONE: '/delivery-zones',

  SHOP_ORDERS: '/shop-orders',
  SHOP_ORDERS_STATISTICS: '/shop-orders/statistics',
  SHOP_ORDERS_TODAY_BY_DELIVERY_ZONE: '/shop-orders/today/by-delivery-zone',

  DELIVERY_PERSONEL: '/delivery-management/personnel',
  DELIVERY_PLANS: '/delivery-management/plans',
  DELIVERY_MANAGEMENT_ORDERS: '/delivery-management/orders',
};
