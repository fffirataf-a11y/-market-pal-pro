import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, auth, db } from '@/config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // İzin iste ve token al
  const requestPermission = async () => {
    if (typeof Notification === 'undefined') {
      toast({
        title: "Not Supported",
        description: "Notifications are not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const messagingInstance = await messaging;
      
      if (!messagingInstance) {
        toast({
          title: "Not Supported",
          description: "Push notifications are not supported",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        
        // Service worker'ı kaydet
        const registration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js',
          { scope: '/' }
        );
        
        console.log('✅ Service Worker registered');
        
        // FCM token al
        const currentToken = await getToken(messagingInstance, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          console.log('✅ FCM Token:', currentToken);
          setToken(currentToken);

          // Token'ı Firestore'a kaydet
          const user = auth.currentUser;
          if (user) {
            await updateDoc(doc(db, 'users', user.uid), {
              fcmToken: currentToken,
              notificationsEnabled: true,
              lastTokenUpdate: new Date().toISOString(),
            });
            console.log('✅ Token saved to Firestore');
          }

          toast({
            title: "✅ Notifications Enabled",
            description: "You'll receive updates about friend requests and shared lists",
          });

          // Test notification
          new Notification('SmartMarket', {
            body: 'Notifications are now enabled! 🔔',
            icon: '/logo.png',
            badge: '/logo.png',
          });
        } else {
          console.log('❌ No registration token available');
          toast({
            title: "Error",
            description: "Could not get notification token",
            variant: "destructive",
          });
        }
      } else if (permission === 'denied') {
        console.log('❌ Notification permission denied');
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Foreground notification listener
  useEffect(() => {
    const setupForegroundListener = async () => {
      const messagingInstance = await messaging;
      if (!messagingInstance) return;

      const unsubscribe = onMessage(messagingInstance, (payload) => {
        console.log('🔔 Foreground message received:', payload);
        
        const { title, body, icon } = payload.notification || {};
        
        // Toast notification göster
        toast({
          title: title || "New Notification",
          description: body || "You have a new update",
        });

        // Browser notification göster (app açıkken)
        if (Notification.permission === 'granted') {
          new Notification(title || 'SmartMarket', {
            body: body || 'You have a new notification',
            icon: icon || '/logo.png',
            badge: '/logo.png',
            tag: payload.data?.type || 'notification',
          });
        }
      });

      return unsubscribe;
    };

    setupForegroundListener();
  }, [toast]);

  return {
    permission,
    token,
    loading,
    requestPermission,
  };
};

// ✅ YENİ: Gerçek zamanlı bildirim dinleyici
export const useRealtimeNotifications = () => {
  useEffect(() => {
    const currentUser = auth.currentUser;
    
    // Kullanıcı girişini dinle
    const checkAuth = () => {
      const user = auth.currentUser;
      if (!user) return;

      // Arkadaş isteklerini dinle
      const friendRequestsQuery = query(
        collection(db, 'friendRequests'),
        where('toUserId', '==', user.uid),
        where('status', '==', 'pending')
      );

      const unsubscribe = onSnapshot(friendRequestsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const request = change.doc.data();
            
            // Sadece yeni istekleri bildir (sayfa yüklendiğinde eskiler gelmesin)
            const requestTime = request.createdAt?.toMillis?.() || 0;
            const now = Date.now();
            
            // Son 5 saniye içinde oluşturulmuşsa bildir
            if (now - requestTime < 5000) {
              if (Notification.permission === 'granted') {
                new Notification('👋 New Friend Request', {
                  body: `${request.fromUserName} wants to be your friend`,
                  icon: request.fromUserPhoto || '/logo.png',
                  tag: 'friend-request',
                });
              }
            }
          }
        });
      });

      return unsubscribe;
    };

    // Auth durumu değişince kontrol et
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAuth();
      }
    });

    return () => unsubscribe();
  }, []);
};