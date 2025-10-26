import { ApiEndPoints } from '../config/Endpoints';
import api from '../config/api';

export async function GetKYCListService({ page = 1, type, paymentVerified }) {
  const response = await api.get(
    `${ApiEndPoints.KYC_LIST}?order=ASC&page=${page}&take=10${type ? `&type=${type}` : ''}${
      paymentVerified ? `&paymentVerified=${paymentVerified}` : ''
    }`,
  );
  return response;
}
export async function GetKYCSTATSService() {
  const response = await api.get(`${ApiEndPoints.KYC_STATS}`);
  return response;
}
export async function GetKYCDetailsService(id) {
  const response = await api.get(`${ApiEndPoints.KYC_LIST}/${id}/`);
  return response;
}
export async function VerifyKYCPaymentService(id) {
  const response = await api.get(`${ApiEndPoints.KYC_LIST}/${id}/verify_payment`);
  return response;
}

// export async function GetUserById(payload) {
//   const response = await api.post(ApiEndPoints.reset_password, payload);
//   return response;
// }
