import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const { toast } = useToast();

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast({
                title: "Back Online",
                description: "Your connection has been restored.",
                duration: 3000,
                className: "bg-green-500 text-white border-green-600",
            });
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast({
                title: "You are Offline",
                description: "You can still view your lists, but changes may not save immediately.",
                duration: 5000,
                variant: "destructive",
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [toast]);

    return isOnline;
};
