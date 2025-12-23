import { ApiEndPoints } from '../config/Endpoints';
import api from '../config/api';
import moment from 'moment';

export async function GetShopsService({ page = 1, limit = 10, status }) {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (status) params.append('status', status);

  const queryString = params.toString();
  const url = queryString ? `${ApiEndPoints.SHOPS}?${queryString}` : ApiEndPoints.SHOPS;

  const response = await api.get(url);
  return response;
}

export async function GetShopDetailsByIdService(id) {
  const response = await api.get(`${ApiEndPoints.SHOPS}/${id}`);
  return response;
}
export async function GetOverallShopStatsService() {
  const response = await api.get(`${ApiEndPoints.SHOPS}/statistics/overall`);
  return response;
}

export async function GetShopStatsByIdService(id) {
  const response = await api.get(`${ApiEndPoints.SHOPS}/${id}/statistics`);
  return response;
}
export async function AssignDeliveryZoneToShopService(id, deliveryZoneId) {
  const response = await api.put(`${ApiEndPoints.SHOPS}/${id}/delivery-zone`, { deliveryZoneId });
  return response;
}
export async function GetShopOrdersService({ id, page, limit, startDate, endDate }) {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (startDate) params.append('startDate', moment(startDate).format('YYYY-MM-DD'));
  if (endDate) params.append('endDate', moment(endDate).format('YYYY-MM-DD'));

  const queryString = params.toString();
  const url = queryString ? `${ApiEndPoints.SHOPS}/${id}/orders?${queryString}` : `${ApiEndPoints.SHOPS}/${id}/orders`;

  const response = await api.get(url);
  return response;
}
