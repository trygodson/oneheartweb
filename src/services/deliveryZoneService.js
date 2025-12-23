import { ApiEndPoints } from '../config/Endpoints';
import api from '../config/api';
import moment from 'moment';

export async function GetDeliveryZoneService({ status }) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);

  const queryString = params.toString();
  const url = queryString ? `${ApiEndPoints.DELIVERY_ZONE}?${queryString}` : ApiEndPoints.DELIVERY_ZONE;

  const response = await api.get(url);
  return response;
}

export async function createDeliveryZoneService(payload) {
  const response = await api.post(`${ApiEndPoints.DELIVERY_ZONE}`, payload);
  return response;
}

export async function UpdateDeliveryZoneService(id, payload) {
  const response = await api.put(`${ApiEndPoints.DELIVERY_ZONE}/${id}`, payload);
  return response;
}
export async function GetLocationStateService() {
  const response = await api.get(`${ApiEndPoints.DELIVERY_ZONE}/locations/states`);
  return response;
}
export async function GetLocationLGAByStateService(stateId) {
  const response = await api.get(`${ApiEndPoints.DELIVERY_ZONE}/locations/states/${stateId}/lgas`);
  return response;
}
export async function GetLocationCityByLGAService(lgaId) {
  const response = await api.get(`${ApiEndPoints.DELIVERY_ZONE}/locations/lgas/${lgaId}/cities`);
  return response;
}

export async function DeleteDeliveryZoneService(id) {
  const response = await api.delete(`${ApiEndPoints.DELIVERY_ZONE}/${id}`);
  return response;
}

export async function GetDeliveryPersonelService({ page = 1, limit = 10 }) {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  // if (status) params.append('status', status);

  const queryString = params.toString();
  const url = queryString ? `${ApiEndPoints.DELIVERY_PERSONEL}?${queryString}` : ApiEndPoints.DELIVERY_PERSONEL;

  const response = await api.get(url);
  return response;
}
