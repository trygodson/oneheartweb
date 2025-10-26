import { ApiEndPoints } from '../config/Endpoints';
import api from '../config/api';

export async function GetGeneralUserDashboardService({ userId }) {
  const response = await api.get(`${ApiEndPoints.GENERAL_USER_DASHBOARD}?user_id=${userId}`);
  return response;
}

// export async function GetUserById(payload) {
//   const response = await api.post(ApiEndPoints.reset_password, payload);
//   return response;
// }
