import { ApiEndPoints } from '../config/Endpoints';
import api from '../config/api';

export async function LoginService(payload) {
  const response = await api.post(`${ApiEndPoints.LOGIN}`, payload);
  return response;
}
// export async function SendRestOtpService(payload) {
//   const response = await api.post(`${ApiEndPoints.SEND_RESET_OTP}`, payload);
//   return response;
// }
// export async function VerifyRestOtpService(payload) {
//   const response = await api.post(`${ApiEndPoints.VERIFY_RESET_OTP}`, payload);
//   return response;
// }
// export async function RestPasswordService(payload) {
//   const response = await api.post(`${ApiEndPoints.RESET_PASSWORD}`, payload);
//   return response;
// }
// export async function GetUserById(payload) {
//   const response = await api.post(ApiEndPoints.reset_password, payload);
//   return response;
// }
