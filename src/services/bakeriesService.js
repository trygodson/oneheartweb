import { ApiEndPoints } from '../config/Endpoints';
import api from '../config/api';
import moment from 'moment';

export async function GetBakeriesService({ status, limit = 10, page = 1 }) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (limit) params.append('limit', limit);
  if (page) params.append('page', page);

  const queryString = params.toString();
  const url = queryString ? `${ApiEndPoints.BAKERIES}?${queryString}` : ApiEndPoints.BAKERIES;

  const response = await api.get(url);
  return response;
}
export async function GetBakeriesStatisticsService() {
  const response = await api.get(`${ApiEndPoints.BAKERIES_STATISTICS}`);
  return response;
}
export async function GetBakeriesDetailsService(id) {
  const response = await api.get(`${ApiEndPoints.BAKERIES}/${id}`);
  return response;
}
export async function GetBakeriesProductsService({ id, page = 1, limit = 10 }) {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const queryString = params.toString();
  const url = queryString
    ? `${ApiEndPoints.BAKERIES}/${id}/products?${queryString}`
    : `${ApiEndPoints.BAKERIES}/${id}/products`;
  const response = await api.get(url);
  return response;
}
export async function GetBakeriesOrdersService({
  id,
  page = 1,
  limit = 10,
  startDate = moment().subtract(1, 'year').format('YYYY-MM-DD'),
  endDate = moment().format('YYYY-MM-DD'),
}) {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (startDate) params.append('startDate', moment(startDate).format('YYYY-MM-DD'));
  if (endDate) params.append('endDate', moment(endDate).format('YYYY-MM-DD'));

  const queryString = params.toString();
  const url = queryString
    ? `${ApiEndPoints.BAKERIES}/${id}/orders?${queryString}`
    : `${ApiEndPoints.BAKERIES}/${id}/orders`;
  const response = await api.get(url);
  return response;
}
export async function GetBakeriesOrdersStatisticsAllTimeService(id) {
  const response = await api.get(`${ApiEndPoints.BAKERIES}/${id}/orders/statistics/all-time`);
  return response;
}
export async function GetBakeriesOrdersStatisticsDailyService(id, date = moment().format('YYYY-MM-DD')) {
  const response = await api.get(`${ApiEndPoints.BAKERIES}/${id}/orders/statistics/daily?date=${date}`);
  return response;
}

export async function ApproveBakeryByIdService(id) {
  const response = await api.put(`${ApiEndPoints.BAKERIES}/${id}/approve`);
  return response;
}

export async function RejectBakeryByIdService(id) {
  const response = await api.put(`${ApiEndPoints.BAKERIES}/${id}/reject`);
  return response;
}

export async function SuspendBakeryByIdService(id) {
  const response = await api.put(`${ApiEndPoints.BAKERIES}/${id}/suspend`);
  return response;
}

export async function ReactivateSuspendedBakeryByIdService(id) {
  const response = await api.put(`${ApiEndPoints.BAKERIES}/${id}/reactivate`);
  return response;
}
