import type { PlanType } from "@/hooks/useSubscription";
import { ADS_ENABLED, ADS_AUTOPLAY_ON_START, ADS_SESSION_PLAY_KEY } from "@/config/featureFlags";
import { AdMob, RewardedAdOptions as AdMobRewardedAdOptions, BannerAdOptions, BannerAdPosition, BannerAdSize } from "@capacitor-community/admob";

// Export BannerAdPosition for use in components
export { BannerAdPosition };
import { Capacitor } from "@capacitor/core";

export type RewardedAdOptions = {
  placement?: string;
  onComplete?: () => void;
};

const AD_ELIGIBLE_PLANS: PlanType[] = ["free"];

// AdMob App ID'leri
// iOS App ID: AdMob Console > Uygulamalar > iOS uygulaması > App ID
// Android App ID: AdMob Console > Uygulamalar > Android uygulaması > App ID
const ADMOB_APP_IDS = {
  ios: "ca-app-pub-3272601063768123~1569350116", // iOS App ID (güncellendi)
  android: "ca-app-pub-3272601063768123~7349673296", // Android App ID (güncellendi)
};

// iOS Ad Unit ID'leri (gerçek ID'ler - güncellendi)
const IOS_AD_UNIT_IDS = {
  banner: "ca-app-pub-3272601063768123/9864866432", // Banner_AnaEkran
  interstitial: "ca-app-pub-3272601063768123/6092431943", // Interstital_Gecis
  appOpen: "ca-app-pub-3272601063768123/4016932944", // Interstital_AppAcik (App Open)
  rewarded: "ca-app-pub-3272601063768123/4531938264", // Rewarded_Odullu (güncellendi)
};

// Android Ad Unit ID'leri (gerçek ID'ler - güncellendi)
const ANDROID_AD_UNIT_IDS = {
  banner: "ca-app-pub-3272601063768123/9864866432", // Banner_AnaEkran
  interstitial: "ca-app-pub-3272601063768123/6092431943", // Interstital_Gecis
  appOpen: "ca-app-pub-3272601063768123/4016932944", // Interstital_AppAcik (App Open)
  rewarded: "ca-app-pub-3272601063768123/5285233841", // Rewarded_Odullu (güncellendi)
};

// AdMob Mediation ile desteklenen ağlar
// AdMob Mediation, aşağıdaki ağları otomatik olarak yönetir ve en yüksek teklifi seçer:
// - Google AdMob
// - Meta Ads (Facebook)
// - Unity Ads
// - AppLovin
// - ironSource
// - InMobi
// - Smaato
// - Chartboost
// - PubMatic
// - Tapjoy
// - AdColony
// - Vungle
// - Fyber
// - MoPub
// - AppLovin MAX
// Bu ağlar AdMob Mediation dashboard'unda yapılandırılır ve otomatik olarak en yüksek teklifi veren ağ seçilir.

let adMobInitialized = false;

/**
 * AdMob'u başlatır
 */
const initializeAdMob = async (): Promise<void> => {
  if (adMobInitialized) return;
  
  // Sadece mobil platformlarda çalış
  if (!Capacitor.isNativePlatform()) {
    console.log("[Ads] Web platform - AdMob disabled");
    return;
  }

  try {
    const platform = Capacitor.getPlatform();
    const appId = platform === "ios" ? ADMOB_APP_IDS.ios : ADMOB_APP_IDS.android;

    await AdMob.initialize({
      requestTrackingAuthorization: true,
      // Test cihazları: AdMob Console > Settings > Test devices'ten alınan ID'ler
      // Android için: AdMob Console'da görünen "Reklam kimliği/IDFA" değeri
      // initializeForTesting: true kullanıldığında tüm cihazlar test modunda çalışır
      testingDevices: [
        // AdMob Console'dan aldığınız test device ID'lerini buraya ekleyin
        // Örnek: "1de63915-e655-4167-a46c-938a1cea67fb"
      ],
      initializeForTesting: true, // Test modu - tüm cihazlar test modunda çalışır
    });

    // App ID'yi ayarla (Android'de setAppMuted ve setAppVolume desteklenmiyor)
    if (platform === "ios") {
      await AdMob.setAppMuted({ value: false });
      await AdMob.setAppVolume({ value: 1.0 });
    }

    adMobInitialized = true;
    console.log("[Ads] ✅ AdMob initialized successfully");
    console.log("[Ads] 📱 Platform:", platform);
    console.log("[Ads] 🔑 App ID:", appId);
    console.log("[Ads] 💡 AdMob Mediation aktif - En yüksek teklifi veren ağ otomatik seçilecek");
  } catch (error) {
    console.error("[Ads] ❌ AdMob initialization error:", error);
    throw error;
  }
};

export const isAdSupportedForPlan = (plan: PlanType): boolean => {
  return AD_ELIGIBLE_PLANS.includes(plan);
};

/**
 * Plan kontrolü yapar - sadece free plan kullanıcıları reklam görebilir
 */
const shouldShowAd = (plan: PlanType): boolean => {
  return isAdSupportedForPlan(plan);
};

/**
 * Rewarded ad gösterir
 * AdMob Mediation, tüm yapılandırılmış ağlardan teklif alır ve en yüksek teklifi veren ağın reklamını gösterir
 */
export const showRewardedAdPlaceholder = async (
  plan: PlanType,
  options: RewardedAdOptions = {}
): Promise<void> => {
  // Plan kontrolü - sadece free plan kullanıcıları reklam görebilir
  if (!shouldShowAd(plan)) {
    console.log("[Ads] ⛔ Rewarded ad blocked - user has premium/pro plan");
    options.onComplete?.(); // Callback'i çağır ama reklam gösterme
    return;
  }

  const placement = options.placement ?? "generic";
  console.log(`[Ads] Rewarded ad requested for placement: ${placement}`);

  // Web platformunda placeholder göster
  if (!Capacitor.isNativePlatform()) {
    console.log("[Ads] Web platform - showing placeholder");
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log("[Ads] Placeholder rewarded ad finished");
    options.onComplete?.();
    return;
  }

  try {
    // AdMob'u başlat (henüz başlatılmadıysa)
    await initializeAdMob();

    const platform = Capacitor.getPlatform();
    const adUnitId = platform === "ios" ? IOS_AD_UNIT_IDS.rewarded : ANDROID_AD_UNIT_IDS.rewarded;

    console.log("[Ads] 🎯 Loading rewarded ad from AdMob Mediation...");
    console.log("[Ads] 💰 AdMob Mediation will automatically select the network with the highest bid");

    // Rewarded ad'ı yükle
    const rewardedAdOptions: AdMobRewardedAdOptions = {
      adUnitId: adUnitId,
    };

    // Ad'ı hazırla
    await AdMob.prepareRewardVideoAd(rewardedAdOptions);

    // Ad'ı göster
    const reward = await AdMob.showRewardVideoAd();

    console.log("[Ads] ✅ Rewarded ad completed");
    console.log("[Ads] 🎁 Reward:", reward);
    console.log("[Ads] 💵 Selected network:", reward.type || "AdMob Mediation");

    // Ödül verildi, callback'i çağır
    options.onComplete?.();
  } catch (error) {
    console.error("[Ads] ❌ Rewarded ad error:", error);
    // Hata durumunda da callback'i çağır (kullanıcı deneyimi için)
    options.onComplete?.();
  }
};

/**
 * Banner ad gösterir
 * Sadece free plan kullanıcılarına gösterilir
 */
export const showBannerAd = async (plan: PlanType, position: BannerAdPosition = BannerAdPosition.BOTTOM_CENTER): Promise<string | null> => {
  // Plan kontrolü - sadece free plan kullanıcıları reklam görebilir
  if (!shouldShowAd(plan)) {
    console.log("[Ads] ⛔ Banner ad blocked - user has premium/pro plan");
    return null;
  }

  // Web platformunda banner gösterilmez
  if (!Capacitor.isNativePlatform()) {
    console.log("[Ads] Web platform - banner ad disabled");
    return null;
  }

  try {
    // AdMob'u başlat (henüz başlatılmadıysa)
    await initializeAdMob();

    const platform = Capacitor.getPlatform();
    const adUnitId = platform === "ios" ? IOS_AD_UNIT_IDS.banner : ANDROID_AD_UNIT_IDS.banner;

    console.log("[Ads] 🎯 Loading banner ad from AdMob Mediation...");

    const bannerOptions: BannerAdOptions = {
      adId: adUnitId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: position,
      margin: 0,
    };

    const result = await AdMob.showBanner(bannerOptions);
    console.log("[Ads] ✅ Banner ad shown:", result);

    return result;
  } catch (error) {
    console.error("[Ads] ❌ Banner ad error:", error);
    return null;
  }
};

/**
 * Banner ad'ı gizler
 */
export const hideBannerAd = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.hideBanner();
    console.log("[Ads] ✅ Banner ad hidden");
  } catch (error) {
    console.error("[Ads] ❌ Hide banner error:", error);
  }
};

/**
 * Banner ad'ı kaldırır (tamamen siler)
 */
export const removeBannerAd = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.removeBanner();
    console.log("[Ads] ✅ Banner ad removed");
  } catch (error) {
    console.error("[Ads] ❌ Remove banner error:", error);
  }
};

/**
 * Interstitial ad gösterir
 * Sadece free plan kullanıcılarına gösterilir
 */
export const showInterstitialAd = async (plan: PlanType): Promise<void> => {
  // Plan kontrolü - sadece free plan kullanıcıları reklam görebilir
  if (!shouldShowAd(plan)) {
    console.log("[Ads] ⛔ Interstitial ad blocked - user has premium/pro plan");
    return;
  }

  // Web platformunda placeholder göster
  if (!Capacitor.isNativePlatform()) {
    console.log("[Ads] Web platform - showing placeholder");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return;
  }

  try {
    // AdMob'u başlat (henüz başlatılmadıysa)
    await initializeAdMob();

    const platform = Capacitor.getPlatform();
    const adUnitId = platform === "ios" ? IOS_AD_UNIT_IDS.interstitial : ANDROID_AD_UNIT_IDS.interstitial;

    console.log("[Ads] 🎯 Loading interstitial ad from AdMob Mediation...");
    console.log("[Ads] 💰 AdMob Mediation will automatically select the network with the highest bid");

    // Interstitial ad'ı hazırla
    await AdMob.prepareInterstitial({ adId: adUnitId });

    // Interstitial ad'ı göster
    await AdMob.showInterstitial();

    console.log("[Ads] ✅ Interstitial ad shown");
  } catch (error) {
    console.error("[Ads] ❌ Interstitial ad error:", error);
  }
};

/**
 * App Open ad gösterir
 * Sadece free plan kullanıcılarına gösterilir
 * Uygulama açılışında veya uygulamaya dönüldüğünde gösterilir
 */
export const showAppOpenAd = async (plan: PlanType): Promise<void> => {
  // Plan kontrolü - sadece free plan kullanıcıları reklam görebilir
  if (!shouldShowAd(plan)) {
    console.log("[Ads] ⛔ App Open ad blocked - user has premium/pro plan");
    return;
  }

  // Web platformunda gösterilmez
  if (!Capacitor.isNativePlatform()) {
    console.log("[Ads] Web platform - app open ad disabled");
    return;
  }

  try {
    // AdMob'u başlat (henüz başlatılmadıysa)
    await initializeAdMob();

    const platform = Capacitor.getPlatform();
    const adUnitId = platform === "ios" ? IOS_AD_UNIT_IDS.appOpen : ANDROID_AD_UNIT_IDS.appOpen;

    console.log("[Ads] 🎯 Loading app open ad from AdMob Mediation...");
    console.log("[Ads] 💰 AdMob Mediation will automatically select the network with the highest bid");

    // App Open ad'ı hazırla
    await AdMob.prepareAppOpenAd({ adId: adUnitId });

    // App Open ad'ı göster
    await AdMob.showAppOpenAd();

    console.log("[Ads] ✅ App Open ad shown");
  } catch (error) {
    console.error("[Ads] ❌ App Open ad error:", error);
  }
};

/**
 * If feature flags allow and this session hasn't auto-played yet,
 * auto-play a rewarded ad for eligible plans on app start.
 */
export const maybeAutoplayOnStart = async (
  plan: PlanType,
  placement = "autoplay_start",
  onComplete?: () => void
) => {
  if (!ADS_ENABLED || !ADS_AUTOPLAY_ON_START) return;
  if (!isAdSupportedForPlan(plan)) return;

  // Only once per session
  const played = sessionStorage.getItem(ADS_SESSION_PLAY_KEY);
  if (played === "1") return;

  await showRewardedAdPlaceholder(plan, { placement, onComplete });
  sessionStorage.setItem(ADS_SESSION_PLAY_KEY, "1");
};

