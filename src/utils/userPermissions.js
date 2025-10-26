export const userPermissions = {
  inspectorAdmin: 2,
  inspector: 3,
  auditor: 4,
  vesselMaster: 5,
  hod: 6,
  generalUsers: 7,
};

export const partnerAdminCheck = (user) => {
  if ((user = userPermissions.Admin)) {
    return true;
  } else {
    return false;
  }
};
