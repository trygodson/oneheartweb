// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: 'AIzaSyAYlx0DyUj5Fxddkpc5W4iS3V2Z6Rg09SE',
  authDomain: 'naviscore-328c9.firebaseapp.com',
  projectId: 'naviscore-328c9',
  storageBucket: 'naviscore-328c9.firebasestorage.app',
  messagingSenderId: '488608433615',
  appId: '1:488608433615:web:7f8a80693075b215c8feba',
  measurementId: 'G-KYJCZBN6TQ',
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.svg',
    badge: '/logo.svg',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.', event);

  event.notification.close();

  // Handle the click action (e.g., open a URL)
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
