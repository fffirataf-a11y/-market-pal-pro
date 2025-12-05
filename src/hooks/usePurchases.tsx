import { useState, useEffect } from 'react';
import { Purchases, LOG_LEVEL, PurchasesOfferings, CustomerInfo } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export type PurchaseStatus = 'idle' | 'loading' | 'success' | 'error';

interface UsePurchasesReturn {
  offerings: PurchasesOfferings | null;
  customerInfo: CustomerInfo | null;
  isLoading: boolean;
  error: string | null;
  purchasePremium: (period?: 'monthly' | 'yearly') => Promise<boolean>;
  purchasePro: (period?: 'monthly' | 'yearly') => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  checkActiveSubscription: () => 'free' | 'premium' | 'pro';
}

const REVENUECAT_API_KEY = {
  ios: 'appl_pMUUgJTRkfjqIQxitaAgTgSSBLV',
  android: 'goog_VeKdfhekIaXDfJyinZIRpzlqHON',
};

export const usePurchases = (): UsePurchasesReturn => {
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize RevenueCat
  useEffect(() => {
    const initPurchases = async () => {
      try {
        // Sadece mobil platformlarda çalış
        if (!Capacitor.isNativePlatform()) {
          console.log('Web platform - IAP disabled');
          return;
        }

        const platform = Capacitor.getPlatform();
        const apiKey = platform === 'ios' ? REVENUECAT_API_KEY.ios : REVENUECAT_API_KEY.android;

        await Purchases.configure({ apiKey: apiKey });
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

        // Mevcut offerings'i al
        const offerings = await Purchases.getOfferings();
        setOfferings(offerings);

        // Kullanıcı bilgilerini al
        const { customerInfo: info } = await Purchases.getCustomerInfo();
        setCustomerInfo(info);

        console.log('✅ RevenueCat initialized successfully');
        console.log('📦 Available offerings:', offerings);
        console.log('👤 Customer info:', info);

        // Listener ekle
        await Purchases.addCustomerInfoUpdateListener((info) => {
          console.log('🔄 Customer Info Updated:', info);
          setCustomerInfo(info);
        });

      } catch (err) {
        console.error('RevenueCat init error:', err);
      }
    };

    initPurchases();
  }, []);

  // Premium satın al
  const purchasePremium = async (period: 'monthly' | 'yearly' = 'monthly'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('IAP sadece mobil platformlarda çalışır');
      }

      const offering = offerings?.current;
      if (!offering) {
        throw new Error('Ürün bulunamadı');
      }

      // Premium package'ı bul
      const identifier = period === 'monthly' ? 'premium_monthly' : 'premium_yearly';
      const premiumPackage = offering.availablePackages.find(
        (pkg) => pkg.identifier === identifier
      );

      if (!premiumPackage) {
        console.error(`❌ Premium package (${identifier}) not found. Available packages:`,
          offering.availablePackages.map(p => p.identifier));
        throw new Error('Premium paketi bulunamadı');
      }

      // Heuristic check
      if (period === 'yearly' && !premiumPackage.identifier.includes('yearly')) {
        console.warn('⚠️ Warning: Requested YEARLY period but package identifier does not contain "yearly". Check RevenueCat configuration.');
      }

      console.log(`🛒 Purchasing Premium plan (${period}):`, premiumPackage.identifier);
      console.log(`🆔 Product ID:`, premiumPackage.product.identifier);

      const result = await Purchases.purchasePackage({ aPackage: premiumPackage });

      console.log('📦 Purchase result:', result);

      if (result.customerInfo.entitlements.active['premium']) {
        setCustomerInfo(result.customerInfo);
        console.log('✅ Premium plan purchase successful');
        setIsLoading(false);
        return true;
      }

      throw new Error('Satın alma başarısız - Premium entitlement aktif değil');
    } catch (err: any) {
      console.error('❌ Premium purchase error:', err);
      setError(err.message);
      setIsLoading(false);
      return false;
    }
  };

  // Pro satın al
  const purchasePro = async (period: 'monthly' | 'yearly' = 'monthly'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('IAP sadece mobil platformlarda çalışır');
      }

      const offering = offerings?.current;
      if (!offering) {
        throw new Error('Ürün bulunamadı');
      }

      // Pro package'ı bul
      const identifier = period === 'monthly' ? 'pro_monthly' : 'pro_yearly';
      const proPackage = offering.availablePackages.find(
        (pkg) => pkg.identifier === identifier
      );

      if (!proPackage) {
        console.error(`❌ Pro package (${identifier}) not found. Available packages:`,
          offering.availablePackages.map(p => p.identifier));
        throw new Error('Pro paketi bulunamadı');
      }

      // Heuristic check
      if (period === 'yearly' && !proPackage.identifier.includes('yearly')) {
        console.warn('⚠️ Warning: Requested YEARLY period but package identifier does not contain "yearly". Check RevenueCat configuration.');
      }

      console.log(`🛒 Purchasing Pro plan (${period}):`, proPackage.identifier);
      console.log(`🆔 Product ID:`, proPackage.product.identifier);

      const result = await Purchases.purchasePackage({ aPackage: proPackage });

      console.log('📦 Purchase result:', result);

      if (result.customerInfo.entitlements.active['pro']) {
        setCustomerInfo(result.customerInfo);
        console.log('✅ Pro plan purchase successful');
        setIsLoading(false);
        return true;
      }

      throw new Error('Satın alma başarısız - Pro entitlement aktif değil');
    } catch (err: any) {
      console.error('❌ Pro purchase error:', err);
      setError(err.message);
      setIsLoading(false);
      return false;
    }
  };

  // Satın alımları geri yükle
  const restorePurchases = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('IAP sadece mobil platformlarda çalışır');
      }

      const info = await Purchases.restorePurchases();
      setCustomerInfo(info.customerInfo);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('Restore error:', err);
      setError(err.message);
      setIsLoading(false);
      return false;
    }
  };

  // Aktif aboneliği kontrol et
  const checkActiveSubscription = (): 'free' | 'premium' | 'pro' => {
    if (!customerInfo) return 'free';

    const entitlements = customerInfo.entitlements.active;

    if (entitlements['pro']) return 'pro';
    if (entitlements['premium']) return 'premium';

    return 'free';
  };

  return {
    offerings,
    customerInfo,
    isLoading,
    error,
    purchasePremium,
    purchasePro,
    restorePurchases,
    checkActiveSubscription,
  };
};