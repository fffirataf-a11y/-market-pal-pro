import { useRef, useCallback, useEffect } from 'react';
import { showInterstitialAd, preloadInterstitialAd } from '@/lib/adManager';
import type { PlanType } from '@/types/subscription';

interface UseInterstitialAdOptions {
    plan: PlanType;
    interval?: number; // Kaç işlemde bir reklam gösterilecek (default: 3)
}

/**
 * Interstitial (Geçiş) Reklamları için Hook
 * 
 * @example
 * const { showAd } = useInterstitialAd({ plan: 'free', interval: 3 });
 * 
 * const handleAddItem = () => {
 *   // İşlemi yap
 *   addItem();
 *   
 *   // Reklam göster (her 3 işlemde bir)
 *   showAd();
 * };
 */
export const useInterstitialAd = ({ plan, interval = 5 }: UseInterstitialAdOptions) => {
    const actionCount = useRef(0);
    const lastAdShownAt = useRef(0);
    const MIN_AD_INTERVAL_MS = 60000; // Minimum 60 saniye aralık (profesyonel ayar)

    const showAd = useCallback(() => {
        // İşlem sayacını artır
        actionCount.current += 1;

        console.log(`[AdCounter] 📊 Action count: ${actionCount.current}/${interval}`);

        // Her X işlemde bir kontrol et
        if (actionCount.current % interval === 0) {
            const now = Date.now();
            const timeSinceLastAd = now - lastAdShownAt.current;

            // Minimum süre kontrolü (çok sık reklam gösterme)
            if (timeSinceLastAd < MIN_AD_INTERVAL_MS && lastAdShownAt.current !== 0) {
                console.log(`[AdCounter] ⏳ Too soon for ad. Wait ${Math.ceil((MIN_AD_INTERVAL_MS - timeSinceLastAd) / 1000)}s`);
                return;
            }

            console.log('[AdCounter] 🎬 Triggering interstitial ad...');
            lastAdShownAt.current = now;
            showInterstitialAd(plan);
        }
    }, [plan, interval]);

    // Initial preload check
    useEffect(() => {
        preloadInterstitialAd();
    }, []);

    const resetCounter = useCallback(() => {
        actionCount.current = 0;
        console.log('[AdCounter] 🔄 Counter reset');
    }, []);

    return {
        showAd,
        resetCounter,
        currentCount: actionCount.current
    };
};