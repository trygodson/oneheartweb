import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your Firebase configuration (get this from Firebase Console)
const firebaseConfig = {
  apiKey: 'AIzaSyAYlx0DyUj5Fxddkpc5W4iS3V2Z6Rg09SE',
  authDomain: 'naviscore-328c9.firebaseapp.com',
  projectId: 'naviscore-328c9',
  storageBucket: 'naviscore-328c9.firebasestorage.app',
  messagingSenderId: '488608433615',
  appId: '1:488608433615:web:7f8a80693075b215c8feba',
  measurementId: 'G-KYJCZBN6TQ',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
export default app;
