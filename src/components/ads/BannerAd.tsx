import { useEffect, useRef } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { showBannerAd, removeBannerAd, BannerAdPosition } from "@/lib/adManager";
import { Capacitor } from "@capacitor/core";

interface BannerAdProps {
  position?: BannerAdPosition;
  className?: string;
}

/**
 * Banner Ad Component
 * Sadece free plan kullanıcılarına gösterilir
 * Premium ve Pro kullanıcılarına gösterilmez
 */
const BannerAd = ({ position = BannerAdPosition.BOTTOM_CENTER, className }: BannerAdProps) => {
  const { plan } = useSubscription();
  const bannerShown = useRef(false);

  useEffect(() => {
    // Sadece mobil platformlarda ve free plan kullanıcılarına göster
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Banner'ı göster
    const loadBanner = async () => {
      if (!bannerShown.current) {
        bannerShown.current = true;
        await showBannerAd(plan, position);
      }
    };

    loadBanner();

    // Cleanup - component unmount olduğunda banner'ı kaldır
    return () => {
      if (bannerShown.current) {
        removeBannerAd();
        bannerShown.current = false;
      }
    };
  }, [plan, position]);

  // Web platformunda veya premium/pro kullanıcıları için hiçbir şey render etme
  if (!Capacitor.isNativePlatform() || plan !== "free") {
    return null;
  }

  // Banner Capacitor tarafından native olarak gösterilir, bu component sadece kontrol için
  return <div className={className} />;
};

export default BannerAd;

