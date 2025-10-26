import axios from 'axios';
import jwtDecode from 'jwt-decode';
import dayjs from 'dayjs';
import { BASE_URL } from './Endpoints';
import customToast from '../components/Toast/toastify';
import { GET_STORAGE_ITEM, SET_STORAGE_ITEM } from './storage';
import { handleLogout } from '../layout/AppLayoutNew';

const MAX_RETRY_COUNT = 5; // Maximum number of retries
let retryCount = 0; // Initialize the retry counter

let store;

export const injectStore = (_store) => {
  store = _store;
};

export const getToken = () => {
  return GET_STORAGE_ITEM('token');
};

export const dApis = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: '*/*',
    'content-type': 'application/json',
    // Authorization: getToken() ? `Bearer ${getToken()}` : '',
  },
  timeout: 30000,
});

export const setAuthorizationHeader = (token) => {
  dApis.defaults.headers.Authorization = `Bearer ${token}`;
};

// const storedToken = getToken();
// setAuthorizationHeader(storedToken);

export const refreshAccessToken = async (refreshToken, setPartner) => {
  console.log('Just Hit the Refresh');

  // try {
  //   const res = await axios.post(`${BASE_URL}/v1/User/refresh_token`, {
  //     refreshToken,
  //   });
  //   const newToken = res.data.token;
  //   // setAuthorizationHeader(newToken);
  //   SET_STORAGE_ITEM('token', newToken);
  //   if (res.data.account) SET_STORAGE_ITEM('account', res.data?.account);
  //   if (setPartner) setPartner(res.data.account);
  //   return newToken;
  // } catch (error) {
  //   throw error;
  // }
};

dApis.interceptors.request.use(async function (req) {
  if (navigator.onLine) {
    // let authToken = GET_STORAGE_ITEM('token');
    // console.log(authToken, 'token');
    // if (!authToken) {
    //   let tk = GET_STORAGE_ITEM('token') ?? '';
    //   req.headers.Authorization = `Bearer ${tk}`;
    //   return req;
    // } else {
    //   const user = jwtDecode(authToken);
    //   console.log(user, 'authtoken');
    //   const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;
    //   if (!isExpired) {
    //     req.headers.Authorization = `Bearer ${authToken}`;
    //     return req;
    //   }
    //   const refreshToken = GET_STORAGE_ITEM('refresh_token');
    //   customToast('Token Expired, ReLogin', true);
    //   try {
    //     const newToken = await refreshAccessToken(refreshToken);
    //     SET_STORAGE_ITEM('token', newToken);
    //     req.headers.Authorization = `Bearer ${newToken}`;
    //     return req;
    //   } catch (error) {
    //     console.log(error, 'refresh_token error');
    //     handleLogout();
    //   }
    // }

    const authToken = GET_STORAGE_ITEM('token');

    if (authToken) {
      req.headers.Authorization = `Bearer ${authToken}`;
    }
    return req;
  } else {
    customToast('No internet connection', true);
  }
});

dApis.interceptors.response.use(
  (res) => {
    if (res?.data?.data?.message === 'Session Expired') {
      handleLogout();
      return;
    } else return res.data;
  },
  async (err) => {
    if (err?.response?.status === 401) {
      // handleLogout();
      // const refreshToken = GET_STORAGE_ITEM('refresh_token');
      // try {
      //   while (retryCount < MAX_RETRY_COUNT) {
      //     console.log('trying refresh_token', err);
      //     retryCount++;
      //     const newToken = await refreshAccessToken(refreshToken);
      //     SET_STORAGE_ITEM('token', newToken);
      //     dApis.defaults.headers['Authorization'] = `Bearer ${newToken}`;
      //     // err.config.headers.Authorization = `Bearer ${newToken}`;
      //     // return dApis(err.config);
      //     return;
      //   }
      //   customToast('Maximum retry attempts reached.', true);
      //   setTimeout(() => {
      //     window.location.href = '/login';
      //   }, 1000);
      // } catch (refreshError) {
      //   handleLogout();
      //   throw refreshError;
      // }

      if (err?.response.data?.message === 'Session Expired') {
        handleLogout();
        return;
      } else {
        throw err.response.data;
      }
    } else {
      throw err.response.data;
    }
  },
);

export default {
  get: (...args) => dApis.get(...args),
  post: (...args) => dApis.post(...args),
  put: (...args) => dApis.put(...args),
  patch: (...args) => dApis.patch(...args),
  delete: (...args) => dApis.delete(...args),
};

// export function UploadApiService(
//   url,
//   data = null,
//   appendHeader,
//   Headers,
//   method = 'POST',
//   onProgressChange = () => null,
// ) {
//   return new Promise((resolve, reject) => {
//     const headers = appendHeader ? Headers : {};
//     var options = {
//       url: UPLOAD_ASSET_URL + url,
//       method: method,
//       headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data', ...headers },
//       onUploadProgress: (progressEvent) => {
//         const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//         onProgressChange(progress);
//       },
//     };

//     if (data) {
//       options.data = data;
//     }

//     axios(options)
//       .then((res) => {
//         // console.log(res, "res");
//         resolve(res.data);
//       })
//       .catch(async (err) => {
//         // console.log("----err---", err);
//         // reject(err.response);
//         // throw err.response.data;
//         if (err.response) {
//           switch (err.response.status) {
//             case 500:
//               reject(err.response.data);
//               throw 'Internal Server Error';

//             case 401:
//               reject(err.response?.data);

//               break;
//             default:
//               reject(err.response?.data);
//               throw err.response?.data;
//           }
//         } else {
//           // console.log(err, "api service error");
//           reject(err.response?.data);
//           // reject(err);
//           throw err;
//         }
//       });
//   });
// }
