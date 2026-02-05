/**
 * Native Push Notifications Hook for iOS/Android
 * Uses @capacitor/push-notifications for real device push
 * 
 * Features:
 * - Request permission on native devices
 * - Get FCM token and save to Firestore
 * - Handle foreground and background notifications
 * - Deep linking: Navigate to correct screen when notification is tapped
 */

import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const isInitialized = useRef(false);

    // Request permission and register for push notifications
    const initializePushNotifications = useCallback(async () => {
        // Only run on native platforms
        if (!Capacitor.isNativePlatform()) {
            console.log('📱 Push notifications only work on native platforms');
            return;
        }

        // Prevent double initialization
        if (isInitialized.current) return;
        isInitialized.current = true;

        try {
            // Check current permission status
            let permStatus = await PushNotifications.checkPermissions();
            console.log('🔔 Push permission status:', permStatus.receive);

            // Request permission if not granted
            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                console.log('❌ Push notification permission denied');
                return;
            }

            // Register for push notifications
            await PushNotifications.register();
            console.log('✅ Registered for push notifications');

        } catch (error) {
            console.error('❌ Error initializing push notifications:', error);
        }
    }, []);

    // Save FCM token to Firestore
    const saveTokenToFirestore = useCallback(async (fcmToken: string) => {
        const user = auth.currentUser;
        if (!user) {
            console.log('⚠️ No user logged in, cannot save FCM token');
            return;
        }

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                fcmToken: fcmToken,
                fcmTokenUpdatedAt: new Date().toISOString(),
                platform: Capacitor.getPlatform(),
            });
            console.log('✅ FCM token saved to Firestore');
        } catch (error) {
            console.error('❌ Error saving FCM token:', error);
        }
    }, []);

    // Handle deep linking when notification is tapped
    const handleNotificationAction = useCallback((notification: ActionPerformed) => {
        const data = notification.notification.data;
        console.log('🔔 Notification tapped, data:', data);

        const notificationType = data?.type;
        const targetUrl = data?.url;
        const listId = data?.listId;

        // Navigate based on notification type
        switch (notificationType) {
            case 'friend_request':
            case 'friend_accepted':
                // Navigate to profile page (friends tab)
                navigate('/profile', { state: { tab: 'friends' } });
                break;

            case 'list_item_added':
            case 'list_item_deleted':
                // Navigate to specific list
                if (listId) {
                    navigate(`/lists/${listId}`);
                } else if (targetUrl) {
                    navigate(targetUrl);
                } else {
                    navigate('/lists');
                }
                break;

            default:
                // Use URL from data if available
                if (targetUrl) {
                    navigate(targetUrl);
                }
                break;
        }
    }, [navigate]);

    // Set up push notification listeners
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        // Token received listener
        const tokenListener = PushNotifications.addListener('registration', (token: Token) => {
            console.log('✅ FCM Token received:', token.value);
            saveTokenToFirestore(token.value);
        });

        // Registration error listener
        const errorListener = PushNotifications.addListener('registrationError', (error: any) => {
            console.error('❌ Push registration error:', error);
        });

        // Notification received while app is in foreground
        const foregroundListener = PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
            console.log('🔔 Push received (foreground):', notification);

            // Show toast for foreground notifications
            toast({
                title: notification.title || 'New Notification',
                description: notification.body || '',
            });
        });

        // Notification action performed (user tapped notification)
        const actionListener = PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
            console.log('🔔 Push action performed:', notification);
            handleNotificationAction(notification);
        });

        // Initialize push notifications
        initializePushNotifications();

        // Cleanup listeners on unmount
        return () => {
            tokenListener.then(l => l.remove());
            errorListener.then(l => l.remove());
            foregroundListener.then(l => l.remove());
            actionListener.then(l => l.remove());
        };
    }, [initializePushNotifications, saveTokenToFirestore, handleNotificationAction, toast]);

    return {
        initializePushNotifications,
    };
};

export default usePushNotifications;
