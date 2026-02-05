import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { auth } from '@/config/firebase';

const NotificationPermissionDialog = () => {
    const { t } = useTranslation();
    const { isSupported, permission, requestPermission } = useNotifications();
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState(auth.currentUser);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Only show dialog if:
        // 1. User is logged in
        // 2. Notifications are supported (native platform)
        // 3. Permission is not granted yet
        // 4. User hasn't dismissed this dialog before
        const hasSeenDialog = localStorage.getItem('notificationDialogSeen');

        if (user && isSupported && permission === 'default' && !hasSeenDialog) {
            // Show dialog after a short delay for better UX
            const timer = setTimeout(() => {
                setOpen(true);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [user, isSupported, permission]);

    const handleAllow = async () => {
        await requestPermission();
        localStorage.setItem('notificationDialogSeen', 'true');
        setOpen(false);
    };

    const handleDismiss = () => {
        localStorage.setItem('notificationDialogSeen', 'true');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="items-center text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Bell className="h-8 w-8 text-white" />
                    </div>

                    <DialogTitle className="text-xl font-bold">
                        {t('notifications.permissionTitle', 'Bildirimleri Aç')}
                    </DialogTitle>

                    <DialogDescription className="text-base text-muted-foreground">
                        {t(
                            'notifications.permissionDescription',
                            'Arkadaşlık istekleri ve liste güncellemelerinden haberdar ol'
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 mt-4">
                    <Button
                        onClick={handleAllow}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                        {t('notifications.allow', 'İzin Ver')}
                    </Button>

                    <Button
                        onClick={handleDismiss}
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-foreground"
                    >
                        {t('notifications.notNow', 'Şimdi Değil')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default NotificationPermissionDialog;
