import { ApiEndPoints } from '../config/Endpoints';
import api from '../config/api';

export async function UpdateUserProfileService(payload) {
  const response = await api.post(`${ApiEndPoints.SUBMIT_USER_PROFILE}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
}
// export async function GetUserById(payload) {
//   const response = await api.post(ApiEndPoints.reset_password, payload);
//   return response;
// }
