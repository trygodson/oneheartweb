import api from '../../../config/api';
import { ApiEndPoints } from '../../../config/Endpoints';

export async function GetTemplatesService() {
  const response = await api.get(`${ApiEndPoints.GET_TEMPLATES}`);
  return response;
}
export async function GetVesselsService() {
  const response = await api.get(`${ApiEndPoints.GET_VESSELS}`);
  return response;
}
export async function GetInspectionTypesService() {
  const response = await api.get(`${ApiEndPoints.GET_INSPECTION_TYPES}`);
  return response;
}
export async function GetInspectorsService() {
  const response = await api.get(`${ApiEndPoints.GET_INSPECTORS}`);
  return response;
}
export async function GetAuditorsService() {
  const response = await api.get(`${ApiEndPoints.GET_AUDITORS}`);
  return response;
}
export async function GetDefectStatusService() {
  const response = await api.get(`${ApiEndPoints.GET_DEFECT_STATUS}`);
  return response;
}
// export async function GetUserById(payload) {
//   const response = await api.post(ApiEndPoints.reset_password, payload);
//   return response;
// }
