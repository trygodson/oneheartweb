import moment from 'moment-timezone';

export const AssetType = {
  VIDEO: 1,
  IMAGE: 2,
};
export const RequirementType = {
  UPLOAD_VIDEO: 'UPLOAD_VIDEO',
  UPLOAD_PICTURE: 'UPLOAD_PICTURE',
  // Add more types if needed
};
export const timeZoneMoment = (mm = moment()) => {
  return moment(mm).tz('Africa/Lagos', true);
};
