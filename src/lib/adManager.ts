import type { PlanType } from "@/types/subscription";
import { ADS_ENABLED, ADS_AUTOPLAY_ON_START, ADS_SESSION_PLAY_KEY } from "@/config/featureFlags";
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize
} from "@capacitor-community/admob";
import { Capacitor } from "@capacitor/core";

// Export BannerAdPosition for use in components
export { BannerAdPosition };

export type RewardedAdOptions = {
  placement?: string;
  onComplete?: () => void;
  onFailed?: (error: any) => void;
};

// Plan bazlı reklam kontrolü
const FORCED_AD_PLANS: PlanType[] = ["free"]; // Interstitial sadece free
const REWARDED_AD_PLANS: PlanType[] = ["free", "premium"]; // Rewarded free ve premium

// Development mode kontrolü
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

// ============================================
// AD UNIT IDs
// ============================================

const IOS_AD_UNIT_IDS = {
  interstitial: "ca-app-pub-3272601063768123/8718595284", // Interstitial_GecisReklam
  rewarded: "ca-app-pub-3272601063768123/4531938264", // Rewarded_Odullu
};

const ANDROID_AD_UNIT_IDS = {
  interstitial: "ca-app-pub-3272601063768123/6092431943",
  rewarded: "ca-app-pub-3272601063768123/5285233841",
};

const TEST_AD_UNIT_IDS = {
  interstitial: "ca-app-pub-3940256099942544/4411468910",
  rewarded: "ca-app-pub-3940256099942544/1712485313",
  banner: "ca-app-pub-3940256099942544/6300978111",
};

let adMobInitialized = false;

// ============================================
// INITIALIZATION
// ============================================

export const initializeAdMob = async (): Promise<void> => {
  if (adMobInitialized) {
    console.log("[Ads] ✅ Already initialized");
    return;
  }

  if (!Capacitor.isNativePlatform()) {
    console.log("[Ads] 🌐 Web platform - AdMob disabled");
    return;
  }

  try {
    const platform = Capacitor.getPlatform();
    console.log(`[Ads] 📱 Initializing AdMob for ${platform}...`);

    // iOS 14+ için tracking izni iste
    if (platform === "ios") {
      try {
        const admobAny = AdMob as any;
        if (admobAny.requestTrackingAuthorization) {
          const result = await admobAny.requestTrackingAuthorization();
          console.log("[Ads] 📱 Tracking authorization result:", result);
        }
      } catch (trackingError) {
        console.log("[Ads] ⚠️ Tracking authorization failed:", trackingError);
      }
    }

    // AdMob'u initialize et
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
    const useTestAds = platform === 'ios' && isDevelopment;

    console.log(`[Ads] 🎯 Environment: ${import.meta.env.MODE}`);
    console.log(`[Ads] 🧪 Test mode: ${useTestAds ? 'ENABLED' : 'DISABLED'}`);

    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: useTestAds, // Test mode only in development
    });

    // iOS ses ayarları (optional)
    if (platform === "ios") {
      try {
        const admobAny = AdMob as any;
        if (admobAny.setAppMuted) await admobAny.setAppMuted({ value: false });
        if (admobAny.setAppVolume) await admobAny.setAppVolume({ value: 1.0 });
      } catch (audioError) {
        console.log("[Ads] ⚠️ Audio settings not available");
      }
    }

    adMobInitialized = true;
    console.log("[Ads] ✅ AdMob initialized successfully");
    console.log(`[Ads] 🧪 Test mode: ${isDevelopment ? 'ENABLED' : 'DISABLED'}`);
  } catch (error) {
    console.error("[Ads] ❌ AdMob initialization error:", error);
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const isAdSupportedForPlan = (plan: PlanType): boolean => {
  return REWARDED_AD_PLANS.includes(plan);
};

const shouldShowForcedAd = (plan: PlanType): boolean => {
  return FORCED_AD_PLANS.includes(plan);
};

const shouldShowRewardedAd = (plan: PlanType): boolean => {
  return REWARDED_AD_PLANS.includes(plan);
};

const getAdUnitId = (adType: 'interstitial' | 'rewarded'): string => {
  const platform = Capacitor.getPlatform() as 'ios' | 'android';

  // Always use production ad units
  if (platform === 'ios') {
    return IOS_AD_UNIT_IDS[adType];
  } else {
    return ANDROID_AD_UNIT_IDS[adType];
  }
};

// ============================================
// REWARDED ADS
// ============================================

const showRewardedAdPlaceholder = async (
  plan: PlanType,
  options: RewardedAdOptions
): Promise<void> => {
  console.log("[Ads] 🌐 Web platform - showing placeholder");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log("[Ads] ✅ Placeholder rewarded ad completed");
  options.onComplete?.();
};

export const showRewardedAd = async (
  plan: PlanType,
  options: RewardedAdOptions = {}
): Promise<void> => {
  const placement = options.placement ?? "generic";

  console.log(`[Ads] 🎬 Rewarded ad requested`);
  console.log(`[Ads] 📍 Placement: ${placement}`);
  console.log(`[Ads] 👤 Plan: ${plan}`);

  if (!shouldShowRewardedAd(plan)) {
    console.log("[Ads] ⛔ Rewarded ad blocked - plan not eligible");
    options.onFailed?.({ message: 'Plan not eligible for rewarded ads' });
    return;
  }

  if (!Capacitor.isNativePlatform()) {
    await showRewardedAdPlaceholder(plan, options);
    return;
  }

  try {
    await initializeAdMob();

    const platform = Capacitor.getPlatform();
    const adUnitId = getAdUnitId('rewarded');

    console.log(`[Ads] 📱 Platform: ${platform}`);
    console.log(`[Ads] 🎯 Ad Unit ID: ${adUnitId}`);

    const admobAny = AdMob as any;

    // Timeout wrapper function
    const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, errorMsg: string): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(errorMsg)), timeoutMs)
        ),
      ]);
    };

    // Reklam yükle ve göster (10 saniye timeout)
    console.log("[Ads] ⏳ Preparing rewarded ad...");

    try {
      if (admobAny.prepareRewardVideoAd) {
        await withTimeout(
          admobAny.prepareRewardVideoAd({ adId: adUnitId }),
          10000,
          'Rewarded ad preparation timeout'
        );
      }

      console.log("[Ads] 🎬 Showing rewarded ad...");

      if (admobAny.showRewardVideoAd) {
        const reward = await withTimeout(
          admobAny.showRewardVideoAd(),
          30000,
          'Rewarded ad show timeout'
        );
        console.log("[Ads] ✅ Rewarded ad completed successfully:", reward);
        options.onComplete?.();
      }
    } catch (adError: any) {
      console.error("[Ads] ❌ Rewarded ad failed:", adError);
      throw adError;
    }

  } catch (error: any) {
    console.error("[Ads] ❌ Rewarded ad error:", error);
    console.error("[Ads] ❌ Error details:", JSON.stringify(error, null, 2));

    options.onFailed?.(error);
  }
};

// ============================================
// INTERSTITIAL ADS
// ============================================

export const showInterstitialAd = async (plan: PlanType): Promise<void> => {
  console.log(`[Ads] 🎬 Interstitial ad requested for plan: ${plan}`);

  if (!shouldShowForcedAd(plan)) {
    console.log("[Ads] ⛔ Interstitial ad blocked - plan not eligible");
    return;
  }

  if (!Capacitor.isNativePlatform()) {
    console.log("[Ads] 🌐 Web platform - interstitial disabled");
    return;
  }

  try {
    await initializeAdMob();

    const platform = Capacitor.getPlatform();
    const adUnitId = getAdUnitId('interstitial');

    console.log(`[Ads] 📱 Platform: ${platform}`);
    console.log(`[Ads] 🎯 Ad Unit ID: ${adUnitId}`);

    const admobAny = AdMob as any;

    // Listener'ları ekle
    if (admobAny.addListener) {
      admobAny.addListener('onInterstitialAdLoaded', () => {
        console.log("[Ads] ✅ Interstitial ad loaded");
      });

      admobAny.addListener('onInterstitialAdFailedToLoad', (error: any) => {
        console.error("[Ads] ❌ Interstitial ad failed to load:", error);
      });

      admobAny.addListener('onInterstitialAdShowed', () => {
        console.log("[Ads] 🎬 Interstitial ad showing");
      });

      admobAny.addListener('onInterstitialAdDismissed', () => {
        console.log("[Ads] 🚪 Interstitial ad dismissed");
        if (admobAny.removeAllListeners) {
          admobAny.removeAllListeners();
        }
      });
    }

    // Reklam yükle
    console.log("[Ads] ⏳ Preparing interstitial ad...");
    if (admobAny.prepareInterstitial) {
      await admobAny.prepareInterstitial({ adId: adUnitId });
    }

    // Reklam göster
    console.log("[Ads] 🎬 Showing interstitial ad...");
    if (admobAny.showInterstitial) {
      await admobAny.showInterstitial();
      console.log("[Ads] ✅ Interstitial ad shown successfully");
    }

  } catch (error) {
    console.error("[Ads] ❌ Interstitial ad error:", error);
    console.error("[Ads] ❌ Error details:", JSON.stringify(error, null, 2));

    const admobAny = AdMob as any;
    if (admobAny.removeAllListeners) {
      admobAny.removeAllListeners();
    }
  }
};

// ============================================
// BANNER ADS - DEVRE DIŞI
// ============================================

export const showBannerAd = async (
  plan: PlanType,
  position: BannerAdPosition = BannerAdPosition.BOTTOM_CENTER
): Promise<any | null> => {
  console.log("[Ads] ⚠️ Banner ads are currently disabled by configuration.");
  return null;
};

export const hideBannerAd = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const admobAny = AdMob as any;
    if (admobAny.hideBanner) await admobAny.hideBanner();
  } catch (error) {
    console.error("[Ads] ❌ Hide banner error:", error);
  }
};

export const removeBannerAd = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const admobAny = AdMob as any;
    if (admobAny.removeBanner) await admobAny.removeBanner();
  } catch (error) {
    console.error("[Ads] ❌ Remove banner error:", error);
  }
};

// ============================================
// APP OPEN ADS - DEVRE DIŞI
// ============================================

export const showAppOpenAd = async (plan: PlanType): Promise<void> => {
  console.log("[Ads] ⚠️ App Open ads currently disabled");
  return;
};

// ============================================
// AUTOPLAY ON START
// ============================================

export const maybeAutoplayOnStart = async (
  plan: PlanType,
  placement = "autoplay_start",
  onComplete?: () => void
) => {
  if (!ADS_ENABLED || !ADS_AUTOPLAY_ON_START) {
    console.log("[Ads] ℹ️ Autoplay disabled by config");
    return;
  }

  if (!isAdSupportedForPlan(plan)) {
    console.log("[Ads] ℹ️ Autoplay not supported for plan:", plan);
    return;
  }

  const played = sessionStorage.getItem(ADS_SESSION_PLAY_KEY);
  if (played === "1") {
    console.log("[Ads] ℹ️ Autoplay already shown this session");
    return;
  }

  console.log("[Ads] 🚀 Showing autoplay ad...");

  if (Capacitor.isNativePlatform()) {
    await showInterstitialAd(plan);
  } else {
    await showRewardedAdPlaceholder(plan, { placement, onComplete });
  }

  sessionStorage.setItem(ADS_SESSION_PLAY_KEY, "1");
  console.log("[Ads] ✅ Autoplay ad completed");
};