import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ToastContainer } from 'react-toastify';
import { Provider } from 'react-redux';
import store from './store/index.js';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <GoogleOAuthProvider clientId="308596514509-rjhqv4osqfn1d4r31u08uva76vdkqarp.apps.googleusercontent.com"> */}
    <Provider store={store}>
      <App />
      <ToastContainer hideProgressBar={true} />
    </Provider>
    {/* </GoogleOAuthProvider> */}
  </StrictMode>,
);
