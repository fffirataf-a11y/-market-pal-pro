import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { auth, db } from '@/config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import i18n from '@/i18n';

export const useNotifications = () => {
  const { toast } = useToast();
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default'>('default');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if push notifications are supported
  const isSupported = Capacitor.isNativePlatform();

  // Initialize and check current permission status
  useEffect(() => {
    const checkPermission = async () => {
      if (!isSupported) return;

      try {
        const result = await PushNotifications.checkPermissions();
        if (result.receive === 'granted') {
          setPermission('granted');
        } else if (result.receive === 'denied') {
          setPermission('denied');
        } else {
          setPermission('default');
        }
      } catch (error) {
        console.log('Push notification check error:', error);
      }
    };

    checkPermission();
  }, [isSupported]);

  // Request permission and register for push notifications
  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: i18n.language === 'tr' ? 'Bilgi' : 'Info',
        description: i18n.language === 'tr'
          ? 'Bildirimler sadece mobil uygulamada çalışır'
          : 'Notifications only work in the mobile app',
      });
      return;
    }

    setLoading(true);

    try {
      // Request permission
      const permResult = await PushNotifications.requestPermissions();

      if (permResult.receive === 'granted') {
        setPermission('granted');

        // Register with Apple/Google for push notifications
        await PushNotifications.register();

        toast({
          title: i18n.language === 'tr' ? '✅ Bildirimler Açıldı' : '✅ Notifications Enabled',
          description: i18n.language === 'tr'
            ? 'Arkadaşlık istekleri ve liste güncellemeleri için bildirim alacaksınız'
            : "You'll receive updates about friend requests and shared lists",
        });
      } else {
        setPermission('denied');
        toast({
          title: i18n.language === 'tr' ? 'Bildirimler Engellendi' : 'Notifications Blocked',
          description: i18n.language === 'tr'
            ? 'Lütfen telefon ayarlarından bildirimleri açın'
            : 'Please enable notifications in your phone settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Push notification registration error:', error);
      toast({
        title: i18n.language === 'tr' ? 'Hata' : 'Error',
        description: i18n.language === 'tr'
          ? 'Bildirimler etkinleştirilemedi'
          : 'Failed to enable notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Listen for push notification events
  useEffect(() => {
    if (!isSupported) return;

    // On registration success, save token to Firestore
    const tokenListener = PushNotifications.addListener('registration', async (token: Token) => {
      console.log('✅ Push registration success, token:', token.value);
      setToken(token.value);

      // Save token to Firestore for the current user
      const user = auth.currentUser;
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            fcmToken: token.value,
            notificationsEnabled: true,
            lastTokenUpdate: new Date().toISOString(),
            platform: Capacitor.getPlatform(),
          });
          console.log('✅ Token saved to Firestore');
        } catch (error) {
          console.error('Error saving token:', error);
        }
      }
    });

    // On registration error
    const errorListener = PushNotifications.addListener('registrationError', (error) => {
      console.error('❌ Push registration error:', error);
    });

    // On push notification received (foreground)
    const notificationListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('🔔 Push notification received:', notification);

        // Show toast for foreground notifications
        toast({
          title: notification.title || 'SmartMarket',
          description: notification.body || '',
        });
      }
    );

    // On push notification action (when user taps)
    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification) => {
        console.log('👆 Push notification tapped:', notification);
        // Handle navigation based on notification data if needed
      }
    );

    // Cleanup listeners
    return () => {
      tokenListener.then(l => l.remove());
      errorListener.then(l => l.remove());
      notificationListener.then(l => l.remove());
      actionListener.then(l => l.remove());
    };
  }, [isSupported, toast]);

  // Disable notifications
  const disableNotifications = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          notificationsEnabled: false,
        });
        toast({
          title: i18n.language === 'tr' ? 'Bildirimler Kapatıldı' : 'Notifications Disabled',
          description: i18n.language === 'tr'
            ? 'Artık bildirim almayacaksınız'
            : "You won't receive notifications anymore",
        });
      } catch (error) {
        console.error('Error disabling notifications:', error);
      }
    }
  };

  return {
    permission,
    token,
    loading,
    isSupported,
    requestPermission,
    disableNotifications,
  };
};

// Realtime notification listener (for in-app notifications)
export const useRealtimeNotifications = () => {
  // This can stay as is - it uses Firestore for real-time updates
  // and shows local notifications when appropriate
};