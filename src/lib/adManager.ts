import type { PlanType } from "@/types/subscription";
import { ADS_ENABLED, ADS_AUTOPLAY_ON_START, ADS_SESSION_PLAY_KEY } from "@/config/featureFlags";
import { AdMob, RewardAdOptions as AdMobRewardedAdOptions, BannerAdOptions, BannerAdPosition, BannerAdSize } from "@capacitor-community/admob";

// Export BannerAdPosition for use in components
export { BannerAdPosition };
import { Capacitor } from "@capacitor/core";

export type RewardedAdOptions = {
  placement?: string;
  onComplete?: () => void;
};


const FORCED_AD_PLANS: PlanType[] = ["free"];
const REWARDED_AD_PLANS: PlanType[] = ["free", "premium"];


// AdMob App ID'leri
const ADMOB_APP_IDS = {
  ios: "ca-app-pub-3272601063768123~1569350116",
  android: "ca-app-pub-3272601063768123~7349673296",
};

// iOS Ad Unit ID'leri (GERÇEK PRODUCTION ID'LER)
const IOS_AD_UNIT_IDS = {
  // banner: "", // BANNER DEVRE DIŞI
  interstitial: "ca-app-pub-3272601063768123/6643096287",
  appOpen: "ca-app-pub-3272601063768123/8718595284",
  rewarded: "ca-app-pub-3272601063768123/4531938264", // ✅ DOĞRU
};

// Android Ad Unit ID'leri (GERÇEK PRODUCTION ID'LER)
const ANDROID_AD_UNIT_IDS = {
  // banner: "", // BANNER DEVRE DIŞI
  interstitial: "ca-app-pub-3272601063768123/6092431943",
  appOpen: "ca-app-pub-3272601063768123/4016932944",
  rewarded: "ca-app-pub-3272601063768123/5285233841",
};

let adMobInitialized = false;

/**
 * AdMob'u başlatır
 */
const initializeAdMob = async (): Promise<void> => {
  if (adMobInitialized) return;

  if (!Capacitor.isNativePlatform()) {
    console.log("[Ads] Web platform - AdMob disabled");
    return;
  }

  try {
    const platform = Capacitor.getPlatform();

    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: true,
      // requestTrackingAuthorization kaldırıldı - Info.plist'te halledeceğiz
    });

    if (platform === "ios") {
      // @ts-ignore - methods might be missing
      if (AdMob.setAppMuted) await AdMob.setAppMuted({ value: false });
      // @ts-ignore
      if (AdMob.setAppVolume) await AdMob.setAppVolume({ value: 1.0 });
    }

    adMobInitialized = true;
    console.log("[Ads] ✅ AdMob initialized successfully");
  } catch (error) {
    console.error("[Ads] ❌ AdMob initialization error:", error);
    throw error;
  }
};

// ✅ Check for ANY ad support (used for generic UI checks)
export const isAdSupportedForPlan = (plan: PlanType): boolean => {
  return REWARDED_AD_PLANS.includes(plan);
};

// ❌ Forced Ads (Interstitial, App Open) -> ONLY FREE
const shouldShowForcedAd = (plan: PlanType): boolean => {
  return FORCED_AD_PLANS.includes(plan);
};

// 💰 Rewarded Ads -> Free + Premium
const shouldShowRewardedAd = (plan: PlanType): boolean => {
  return REWARDED_AD_PLANS.includes(plan);
};

/**
 * Web için placeholder function
 */
const showRewardedAdPlaceholder = async (plan: PlanType, options: RewardedAdOptions) => {
  console.log("[Ads] Web platform - showing placeholder");
  await new Promise((resolve) => setTimeout(resolve, 1200));
  console.log("[Ads] Placeholder rewarded ad finished");
  options.onComplete?.();
};

export const showRewardedAd = async (
  plan: PlanType,
  options: RewardedAdOptions = {}
): Promise<void> => {
  if (!shouldShowRewardedAd(plan)) {
    console.log("[Ads] ⛔ Rewarded ad blocked - plan not eligible");
    options.onComplete?.();
    return;
  }

  const placement = options.placement ?? "generic";
  console.log(`[Ads] Rewarded ad requested for placement: ${placement}`);

  if (!Capacitor.isNativePlatform()) {
    await showRewardedAdPlaceholder(plan, options);
    return;
  }

  try {
    await initializeAdMob();

    const platform = Capacitor.getPlatform();
    const adUnitId = platform === "ios" ? IOS_AD_UNIT_IDS.rewarded : ANDROID_AD_UNIT_IDS.rewarded;
    // Rewarded ad'ı yükle
    const rewardedAdOptions: AdMobRewardedAdOptions = {
      adId: adUnitId,
    };

    await AdMob.prepareRewardVideoAd(rewardedAdOptions);
    const reward = await AdMob.showRewardVideoAd();

    console.log("[Ads] ✅ Rewarded ad completed", reward);
    options.onComplete?.();
  } catch (error) {
    console.error("[Ads] ❌ Rewarded ad error:", error);
    // options.onComplete?.(); // HATA ALIRSA ÖDÜL VERME
  }
};

export const showBannerAd = async (plan: PlanType, position: BannerAdPosition = BannerAdPosition.BOTTOM_CENTER): Promise<any | null> => {
  console.log("[Ads] Banner ads are currently disabled by configuration.");
  return null;
  /*
  if (!shouldShowAd(plan)) return null;
  if (!Capacitor.isNativePlatform()) return null;

  try {
    await initializeAdMob();
    const platform = Capacitor.getPlatform();
    // const adUnitId = platform === "ios" ? IOS_AD_UNIT_IDS.banner : ANDROID_AD_UNIT_IDS.banner;

    // const bannerOptions: BannerAdOptions = {
    //   adId: adUnitId,
    //   adSize: BannerAdSize.ADAPTIVE_BANNER,
    //   position: position,
    //   margin: 0,
    // };

    // const result = await AdMob.showBanner(bannerOptions);
    // console.log("[Ads] ✅ Banner ad shown:", result);
    // return result;
    return null;
  } catch (error) {
    console.error("[Ads] ❌ Banner ad error:", error);
    return null;
  }
  */
};

export const hideBannerAd = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.hideBanner();
  } catch (error) {
    console.error("[Ads] ❌ Hide banner error:", error);
  }
};

export const removeBannerAd = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.removeBanner();
  } catch (error) {
    console.error("[Ads] ❌ Remove banner error:", error);
  }
};

export const showInterstitialAd = async (plan: PlanType): Promise<void> => {
  if (!shouldShowForcedAd(plan)) return;
  if (!Capacitor.isNativePlatform()) return;

  try {
    await initializeAdMob();
    const platform = Capacitor.getPlatform();
    const adUnitId = platform === "ios" ? IOS_AD_UNIT_IDS.interstitial : ANDROID_AD_UNIT_IDS.interstitial;

    await AdMob.prepareInterstitial({ adId: adUnitId });
    await AdMob.showInterstitial();
  } catch (error) {
    console.error("[Ads] ❌ Interstitial ad error:", error);
  }
};

export const showAppOpenAd = async (plan: PlanType): Promise<void> => {
  if (!shouldShowForcedAd(plan)) return;
  if (!Capacitor.isNativePlatform()) return;

  try {
    await initializeAdMob();
    const platform = Capacitor.getPlatform();
    const adUnitId = platform === "ios" ? IOS_AD_UNIT_IDS.appOpen : ANDROID_AD_UNIT_IDS.appOpen;

    // @ts-ignore - prepareAppOpenAd might be missing
    if (AdMob.prepareAppOpenAd) await AdMob.prepareAppOpenAd({ adId: adUnitId });
    // @ts-ignore - showAppOpenAd might be missing
    if (AdMob.showAppOpenAd) await AdMob.showAppOpenAd();
  } catch (error) {
    console.error("[Ads] ❌ App Open ad error:", error);
  }
};

export const maybeAutoplayOnStart = async (
  plan: PlanType,
  placement = "autoplay_start",
  onComplete?: () => void
) => {
  if (!ADS_ENABLED || !ADS_AUTOPLAY_ON_START) return;
  if (!isAdSupportedForPlan(plan)) return;

  const played = sessionStorage.getItem(ADS_SESSION_PLAY_KEY);
  if (played === "1") return;

  if (Capacitor.isNativePlatform()) {
    // Native: Show App Open Ad
    await showAppOpenAd(plan);
  } else {
    // Web: Show Placeholder
    await showRewardedAdPlaceholder(plan, { placement, onComplete });
  }

  sessionStorage.setItem(ADS_SESSION_PLAY_KEY, "1");
};

