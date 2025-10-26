import { messaging, getToken, onMessage } from '../config/firebase';
import { toast } from 'react-toastify';

// Your VAPID key from Firebase Console (Cloud Messaging -> Web Push certificates)
const VAPID_KEY = '';

/**
 * Request permission for notifications
 */
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted.');

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (token) {
        // console.log('FCM Token:', token);
        // Send this token to your backend to store it
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else if (permission === 'denied') {
      console.log('Notification permission denied.');
      toast.error('Notification permission denied. Please enable it in browser settings.');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    toast.error('Error requesting notification permission');
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      resolve(payload);
    });
  });

/**
 * Send token to backend
 */
// export const sendTokenToBackend = async (token) => {
//   try {
//     // Replace with your API endpoint
//     // await axios.post('/api/fcm-token', { token });
//     console.log('Token sent to backend:', token);
//     return true;
//   } catch (error) {
//     console.error('Error sending token to backend:', error);
//     return false;
//   }
// };

/**
 * Delete FCM token (for logout)
 */
// export const deleteFCMToken = async () => {
//   try {
//     const token = await getToken(messaging, { vapidKey: VAPID_KEY });
//     if (token) {
//       // Send delete request to backend
//       // await axios.delete('/api/fcm-token', { data: { token } });
//       console.log('Token deleted from backend');
//     }
//   } catch (error) {
//     console.error('Error deleting FCM token:', error);
//   }
// };
