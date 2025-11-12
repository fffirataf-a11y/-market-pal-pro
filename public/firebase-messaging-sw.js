// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config
firebase.initializeApp({
  apiKey: "AIzaSjyCMnNJgknRqPpd16bW-J1xc3baSrQ0Oys",
  authDomain: "smartmarket-3a6bd.firebaseapp.com",
  projectId: "smartmarket-3a6bd",
  storageBucket: "smartmarket-3a6bd.firebasestorage.app",
  messagingSenderId: "425083044183",
  appId: "1:425083044183:web:e2a882385fd42885b8e12"
});

const messaging = firebase.messaging();

// Background notification handler
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'SmartMarket';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/logo.png',
    badge: '/logo.png',
    data: payload.data || {},
    tag: payload.data?.type || 'notification',
    requireInteraction: false,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification);
  
  event.notification.close();
  
  // Open app when notification clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});