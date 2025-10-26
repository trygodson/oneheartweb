import { createContext, useContext, useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '../utils/firebaseNotification';
import { toast } from 'react-toastify';
import { useAuthContext } from './authContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [fcmToken, setFcmToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const { token } = useAuthContext();

  // Request permission when user is logged in
  useEffect(() => {
    // if (token) {
    initializeNotifications();
    // }
  }, [token]);

  const initializeNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setFcmToken(token);
      // Send token to backend
      // await sendTokenToBackend(token);
    }
  };

  // Listen for foreground messages
  useEffect(() => {
    if (fcmToken) {
      const unsubscribe = onMessageListener().then((payload) => {
        console.log('Received foreground message:', payload);
        setNotification(payload);

        // Show toast notification
        toast.info(
          <div>
            <strong>{payload.notification.title}</strong>
            <p>{payload.notification.body}</p>
          </div>,
          {
            autoClose: 5000,
            onClick: () => {
              // Handle notification click
              if (payload.data?.url) {
                window.location.href = payload.data.url;
              }
            },
          },
        );
      });

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [fcmToken]);

  return (
    <NotificationContext.Provider
      value={{
        fcmToken,
        notification,
        requestPermission: initializeNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
