import { ApiEndPoints } from '../config/Endpoints';
import api from '../config/api';
import moment from 'moment';

export async function GetDeliveryPersonelService({ page = 1, limit = 10 }) {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const queryString = params.toString();
  const url = queryString ? `${ApiEndPoints.DELIVERY_PERSONEL}?${queryString}` : ApiEndPoints.DELIVERY_PERSONEL;

  const response = await api.get(url);
  return response;
}
export async function GetDeliveryPersonelOrdersService({
  personnelId,
  page = 1,
  limit = 10,
  startDate = moment().subtract(1, 'month').format('YYYY-MM-DD'),
  endDate = moment().format('YYYY-MM-DD'),
}) {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (startDate) params.append('startDate', moment(startDate).format('YYYY-MM-DD'));
  if (endDate) params.append('endDate', moment(endDate).format('YYYY-MM-DD'));

  const response = await api.get(`${ApiEndPoints.DELIVERY_PERSONEL}/${personnelId}/orders?${params.toString()}`);
  return response;
}

export async function createDeliveryPersonelService(data) {
  const response = await api.post(`${ApiEndPoints.DELIVERY_PERSONEL}`, data);
  return response;
}
export async function markOrderAsCompletedService(id, data) {
  const response = await api.post(`${ApiEndPoints.DELIVERY_MANAGEMENT_ORDERS}/${id}/mark-completed`, data);
  return response;
}

export async function getDeliveryPersonelWalletTransactionsService({
  personnelId,
  page = 1,
  limit = 10,
  startDate = null,
  endDate = null,
}) {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (startDate) params.append('startDate', moment(startDate).format('YYYY-MM-DD'));
  if (endDate) params.append('endDate', moment(endDate).format('YYYY-MM-DD'));

  const queryString = params.toString();
  const url = queryString
    ? `${ApiEndPoints.DELIVERY_PERSONEL}/${personnelId}/wallet-transactions?${queryString}`
    : `${ApiEndPoints.DELIVERY_PERSONEL}/${personnelId}/wallet-transactions`;

  const response = await api.get(url);
  return response;
}
export async function createADeliveryPersonelWalletTransactionsService({ personnelId, data }) {
  const url = `${ApiEndPoints.DELIVERY_PERSONEL}/${personnelId}/wallet-transactions`;

  const response = await api.post(url, data);
  return response;
}
export async function createADeliveryPersonelService(data) {
  const url = `${ApiEndPoints.DELIVERY_PERSONEL}`;

  const response = await api.post(url, data);
  return response;
}
export async function requestAuthCodeForDeliveryPersonelWalletTransactionsService({ personnelId, data }) {
  const url = `${ApiEndPoints.DELIVERY_PERSONEL}/wallet-transactions/request-auth-code`;

  const response = await api.post(url, data);
  return response;
}
export async function getDeliveryPersonelTransactionsStatsService({ personnelId, startDate = null, endDate = null }) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', moment(startDate).format('YYYY-MM-DD'));
  if (endDate) params.append('endDate', moment(endDate).format('YYYY-MM-DD'));

  const queryString = params.toString();
  const url = queryString
    ? `${ApiEndPoints.DELIVERY_PERSONEL}/${personnelId}/wallet-transactions/stats?${queryString}`
    : `${ApiEndPoints.DELIVERY_PERSONEL}/${personnelId}/wallet-transactions/stats`;

  const response = await api.get(url);
  return response;
}

// export async function updateDeliveryPersonelService(id, data) {
//   const response = await api.put(`${ApiEndPoints.DELIVERY_PERSONEL}/${id}`, data);
//   return response;
// }

// export async function deleteDeliveryPersonelService(id) {
//   const response = await api.delete(`${ApiEndPoints.DELIVERY_PERSONEL}/${id}`);
