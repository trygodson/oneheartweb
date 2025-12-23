import { ApiEndPoints } from '../config/Endpoints';
import api from '../config/api';
import moment from 'moment';

export async function SetProductPriceService(p) {
  const response = await api.post(`${ApiEndPoints.ADMIN_BAKERY_PRODUCT}`, p);
  return response;
}
export async function ActivateProductService(id) {
  const response = await api.put(`${ApiEndPoints.BAKERIES}/products/${id}/activate`);
  return response;
}
export async function DeactivateProductService(id) {
  const response = await api.put(`${ApiEndPoints.BAKERIES}/products/${id}/deactivate`);
  return response;
}
