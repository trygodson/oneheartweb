import { ApiEndPoints } from '../config/Endpoints';
import api from '../config/api';
import moment from 'moment';

export async function GetOverallShopOrdersService({
  page = 1,
  limit = 10,
  status,
  businessId,
  paymentStatus,
  startDate,
  endDate,
}) {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (status) params.append('status', status);
  if (businessId) params.append('businessId', businessId);
  if (paymentStatus) params.append('paymentStatus', paymentStatus);
  if (startDate) params.append('startDate', moment(startDate).format('YYYY-MM-DD'));
  if (endDate) params.append('endDate', moment(endDate).format('YYYY-MM-DD'));

  const queryString = params.toString();
  const url = queryString ? `${ApiEndPoints.SHOP_ORDERS}?${queryString}` : ApiEndPoints.SHOP_ORDERS;

  const response = await api.get(url);
  return response;
}

export async function GetShopOrdersStatisticsService({ date }) {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  const queryString = params.toString();
  const url = queryString
    ? `${ApiEndPoints.SHOP_ORDERS_STATISTICS}?${queryString}`
    : ApiEndPoints.SHOP_ORDERS_STATISTICS;
  const response = await api.get(url);
  return response;
}

export async function GetShopOrderDetailByIdService(id) {
  const response = await api.get(`${ApiEndPoints.SHOP_ORDERS}/${id}`);
  return response;
}
export async function SaveDeliveryPlanService(p) {
  const response = await api.post(`${ApiEndPoints.DELIVERY_PLANS}`, p);
  return response;
}

export async function GetDeliveryPlanService({ date, cityId }) {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (cityId) params.append('cityId', cityId);
  const queryString = params.toString();
  const url = queryString ? `${ApiEndPoints.DELIVERY_PLANS}?${queryString}` : ApiEndPoints.DELIVERY_PLANS;
  const response = await api.get(url);
  return response;
}

export async function GetShopOrdersTodayByDeliveryZoneService({ date, cityId }) {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (cityId) params.append('cityId', cityId);
  const queryString = params.toString();
  const url = queryString
    ? `${ApiEndPoints.SHOP_ORDERS_TODAY_BY_DELIVERY_ZONE}?${queryString}`
    : ApiEndPoints.SHOP_ORDERS_TODAY_BY_DELIVERY_ZONE;
  const response = await api.get(url);
  return response;
}
