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
const REWARDED_AD_PLANS: PlanType[] = ["free"]; // Rewarded ads SADECE free kullanıcılara gösterilir - Premium ve Pro kullanıcılar reklam görmez

// Development mode kontrolü
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

// ============================================
// AD UNIT IDs
// ============================================

const IOS_AD_UNIT_IDS = {
  interstitial: "ca-app-pub-3272601063768123/6643096287", // iOS (verified from dashboard)
  rewarded: "ca-app-pub-3272601063768123/4531938264", // iOS (verified from dashboard)
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

// Ad State Management
let adMobInitialized = false;
let isRewardedAdLoaded = false;
let isInterstitialAdLoaded = false;
let isRewardEarned = false;

// Global Listeners State
let rewardAdLoadedListener: any = null;
let rewardAdFailedListener: any = null;
let rewardAdEarnedListener: any = null;
let rewardAdDismissedListener: any = null;
let interstitialAdLoadedListener: any = null;
let interstitialAdDismissedListener: any = null;

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
    console.log(`[Ads] 🧪 Environment: ${import.meta.env.MODE}`);

    // iOS 14+ için tracking izni iste - BU KRİTİK!
    if (platform === "ios") {
      try {
        console.log("[Ads] 📱 Requesting iOS ATT authorization...");
        const admobAny = AdMob as any;
        if (admobAny.requestTrackingAuthorization) {
          const result = await admobAny.requestTrackingAuthorization();
          console.log("[Ads] 📱 ATT authorization result:", JSON.stringify(result));
          // result.status: 'authorized', 'denied', 'restricted', 'notDetermined'
        } else {
          console.log("[Ads] ⚠️ requestTrackingAuthorization not available");
        }
      } catch (trackingError: any) {
        console.log("[Ads] ⚠️ ATT authorization error:", trackingError?.message || trackingError);
        // ATT başarısız olsa bile devam et - personalized ads olmayacak ama reklamlar yine gösterilir
      }
    }

    // Initialize AdMob - PRODUCTION MODE
    console.log(`[Ads] 🎯 Initializing with PRODUCTION settings`);
    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: false,
    });

    // iOS ses ayarları
    if (platform === "ios") {
      try {
        const admobAny = AdMob as any;
        if (admobAny.setAppMuted) await admobAny.setAppMuted({ value: false });
        if (admobAny.setAppVolume) await admobAny.setAppVolume({ value: 1.0 });
        console.log("[Ads] 🔊 iOS audio settings configured");
      } catch (audioError) {
        console.log("[Ads] ⚠️ Audio settings not available");
      }
    }

    adMobInitialized = true;
    console.log("[Ads] ✅ AdMob initialized successfully for", platform);

    // Setup Global Listeners immediately after initialization
    setupGlobalListeners();

  } catch (error: any) {
    console.error("[Ads] ❌ AdMob initialization error:", error?.message || error);
    throw error;
  }
};

const setupGlobalListeners = async () => {
  try {
    // --- REWARDED AD LISTENERS ---

    // 1. Loaded
    if (rewardAdLoadedListener) await rewardAdLoadedListener.remove();
    rewardAdLoadedListener = await AdMob.addListener('onRewardedVideoAdLoaded', (info) => {
      console.log("[Ads] ✅ Rewarded Ad LOADED via Global Listener", info);
      isRewardedAdLoaded = true;
      // Dispatch custom window event for UI updates
      window.dispatchEvent(new Event('rewardedAdLoaded'));
    });

    // 2. Failed to Load
    if (rewardAdFailedListener) await rewardAdFailedListener.remove();
    rewardAdFailedListener = await AdMob.addListener('onRewardedVideoAdFailedToLoad', (error) => {
      console.error("[Ads] ❌ Rewarded Ad FAILED to load via Global Listener", error);
      isRewardedAdLoaded = false;
      // Retry logic could go here globally if needed
    });

    // 3. Reward Earned (CRITICAL)
    if (rewardAdEarnedListener) await rewardAdEarnedListener.remove();
    rewardAdEarnedListener = await AdMob.addListener('onRewardedVideoAdReward', (reward) => {
      console.log("[Ads] 🎁 REWARD EARNED via Global Listener:", reward);
      isRewardEarned = true;
    });

    // 4. Dismissed (Closed)
    if (rewardAdDismissedListener) await rewardAdDismissedListener.remove();
    rewardAdDismissedListener = await AdMob.addListener('onRewardedVideoAdDismissed', () => {
      console.log("[Ads] ❎ Rewarded Ad Dismissed. Earned status:", isRewardEarned);
      isRewardedAdLoaded = false; // Need to reload for next time

      // Immediately start preloading the next one
      preloadRewardedAd();
    });

    // --- INTERSTITIAL AD LISTENERS ---

    // 1. Loaded
    if (interstitialAdLoadedListener) await interstitialAdLoadedListener.remove();
    interstitialAdLoadedListener = await AdMob.addListener('onInterstitialAdLoaded', () => {
      console.log("[Ads] ✅ Interstitial Ad LOADED via Global Listener");
      isInterstitialAdLoaded = true;
    });

    // 2. Dismissed
    if (interstitialAdDismissedListener) await interstitialAdDismissedListener.remove();
    interstitialAdDismissedListener = await AdMob.addListener('onInterstitialAdDismissed', () => {
      console.log("[Ads] ❎ Interstitial Ad Dismissed");
      isInterstitialAdLoaded = false;
      // Preload next one
      preloadInterstitialAd();
    });

    console.log("[Ads] 👂 Global listeners set up successfully");

  } catch (e) {
    console.error("[Ads] ⚠️ Error setting up global listeners:", e);
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const isAdSupportedForPlan = (plan: PlanType): boolean => {
  return REWARDED_AD_PLANS.includes(plan);
};

const shouldShowForcedAd = (plan: PlanType): boolean => {
  const result = FORCED_AD_PLANS.includes(plan);
  console.log(`[Ads] shouldShowInterstitial(plan=${plan}) → ${result}`);
  return result;
};

const shouldShowRewardedAd = (plan: PlanType): boolean => {
  const result = REWARDED_AD_PLANS.includes(plan);
  console.log(`[Ads] shouldShowRewardedAd(plan=${plan}) → ${result}`);
  return result;
};

const getAdUnitId = (adType: 'interstitial' | 'rewarded'): string => {
  const platform = Capacitor.getPlatform() as 'ios' | 'android';

  // Production Ads Requested
  const useTestAds = false;

  // Test mode - use Google test IDs
  if (useTestAds) {
    console.log(`[Ads] 🧪 Using TEST ad unit for ${adType}`);
    return TEST_AD_UNIT_IDS[adType];
  }

  // Production mode - use real ad units
  console.log(`[Ads] 🎯 Using PRODUCTION ad unit for ${adType} on ${platform}`);
  if (platform === 'ios') {
    return IOS_AD_UNIT_IDS[adType];
  } else {
    return ANDROID_AD_UNIT_IDS[adType];
  }
};

// ============================================
// REWARDED ADS (PRELOAD MECHANISM)
// ============================================

export const getRewardedAdStatus = () => isRewardedAdLoaded;

export const preloadRewardedAd = async () => {
  if (!Capacitor.isNativePlatform()) return;
  if (isRewardedAdLoaded) {
    console.log("[Ads] ⚡ Rewarded ad already loaded, skipping preload");
    return;
  }

  try {
    await initializeAdMob();
    const adUnitId = getAdUnitId('rewarded');
    console.log("[Ads] ⏳ Preloading Rewarded Ad...");
    await AdMob.prepareRewardVideoAd({ adId: adUnitId });
  } catch (error) {
    console.error("[Ads] ❌ Error preloading rewarded ad:", error);
  }
};

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
  console.log(`[Ads] 🎬 Show Rewarded Ad Requested`);

  if (!shouldShowRewardedAd(plan)) {
    console.log("[Ads] ⛔ Blocked - plan not eligible");
    options.onFailed?.({ message: 'Plan not eligible' });
    return;
  }

  if (!Capacitor.isNativePlatform()) {
    await showRewardedAdPlaceholder(plan, options);
    return;
  }

  // Check if loaded
  if (!isRewardedAdLoaded) {
    console.log("[Ads] ⚠️ Ad not ready yet. Triggering load and informing user.");
    // Fallback: Try to load it now
    preloadRewardedAd();
    options.onFailed?.({ message: 'Ad is loading, please try again in a moment.' });
    return;
  }

  try {
    // Reset Earned Flag before showing
    isRewardEarned = false;

    console.log("[Ads] 🎬 Showing PRELOADED rewarded ad...");
    await AdMob.showRewardVideoAd();

    // We wait for the dismissal to know when to check for reward
    // The checking logic happens in the caller or we can adapt this function
    // With the new architecture, the global listener handles the 'earned' state.
    // BUT we need to bridge that back to the options.onComplete callback.

    // Strategy: We can't await `showRewardVideoAd` to return the result of "Did user finish?".
    // It returns when the ad opens (usually).
    // So we need to poll or wait for the dismiss event.

    checkRewardAfterDismiss(options.onComplete);

  } catch (error: any) {
    console.error("[Ads] ❌ Error showing rewarded ad:", error);
    options.onFailed?.(error);
  }
};

const checkRewardAfterDismiss = (onComplete?: () => void) => {
  // Check every 500ms if the ad is dismissed
  const checkInterval = setInterval(() => {
    // If ad is no longer loaded, it means it was dismissed (logic in global listener)
    // OR we can rely on a simpler flag.
    // Let's rely on isRewardedAdLoaded becoming false, which happens on dismiss.

    if (!isRewardedAdLoaded) { // Ad was dismissed
      clearInterval(checkInterval);
      console.log("[Ads] 🕵️ Ad closed. Checking reward status...", isRewardEarned);

      if (isRewardEarned) {
        console.log("[Ads] 💰 Granting Reward!");
        onComplete?.();
      } else {
        console.log("[Ads] ❌ Ad closed but no reward earned.");
      }
    }
  }, 1000);
};

// ============================================
// INTERSTITIAL ADS (PRELOAD MECHANISM)
// ============================================

export const preloadInterstitialAd = async () => {
  if (!Capacitor.isNativePlatform()) return;
  if (isInterstitialAdLoaded) return;

  try {
    await initializeAdMob();
    const adUnitId = getAdUnitId('interstitial');
    console.log("[Ads] ⏳ Preloading Interstitial Ad...");
    await AdMob.prepareInterstitial({ adId: adUnitId });
  } catch (error) {
    console.error("[Ads] ❌ Error preloading interstitial:", error);
  }
};

export const showInterstitialAd = async (plan: PlanType): Promise<void> => {
  if (!shouldShowForcedAd(plan)) return;

  if (!Capacitor.isNativePlatform()) {
    console.log("[Ads] 🌐 Web platform - interstitial disabled");
    return;
  }

  if (!isInterstitialAdLoaded) {
    console.log("[Ads] ⚠️ Interstitial not ready. Triggering preload for next time.");
    preloadInterstitialAd();
    return;
  }

  try {
    console.log("[Ads] 🎬 Showing PRELOADED interstitial ad...");
    await AdMob.showInterstitial();
    // Global listener will handle state reset and next preload
  } catch (error) {
    console.error("[Ads] ❌ Error showing interstitial:", error);
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