import { createContext, useContext, useState } from 'react';
import { GET_STORAGE_ITEM, SET_STORAGE_ITEM } from '../config/storage';

const AuthContext = createContext();
export const AuthProvider = ({ ...props }) => {
  const [token, setToken] = useState(GET_STORAGE_ITEM('token'));
  const [userData, setUserData] = useState(GET_STORAGE_ITEM('user'));

  const setLogin = (data) => {
    SET_STORAGE_ITEM('token', data?.accessToken);
    // SET_STORAGE_ITEM('refresh_token', data.refreshToken);
    setToken(data?.accessToken);
  };
  return <AuthContext.Provider value={{ token, setLogin, setUserData, userData }} {...props} />;
};

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within a AuthProvider');
  }

  return context;
}
