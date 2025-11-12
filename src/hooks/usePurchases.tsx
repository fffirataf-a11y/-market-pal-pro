import { useState, useEffect } from 'react';
import { Purchases, LOG_LEVEL, PurchasesOfferings, CustomerInfo } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export type PurchaseStatus = 'idle' | 'loading' | 'success' | 'error';

interface UsePurchasesReturn {
  offerings: PurchasesOfferings | null;
  customerInfo: CustomerInfo | null;
  isLoading: boolean;
  error: string | null;
  purchasePremium: () => Promise<boolean>;
  purchasePro: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  checkActiveSubscription: () => 'free' | 'premium' | 'pro';
}

const REVENUECAT_API_KEY = {
  ios: 'test_nwXexLeAzfEaJLJyaBbAKLKNSWH',
  android: 'test_nwXexLeAzfEaJLJyaBbAKLKNSWH',
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

        // RevenueCat'i başlat - görüntüdeki örneğe göre
        // iOS için apikey (küçük), Android için apiKey (camelCase)
        // Ancak RevenueCat Capacitor SDK her ikisi için de apiKey kullanır
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

        // Premium ve Pro paketlerinin mevcut olup olmadığını kontrol et
        if (offerings?.current) {
          const premiumPackage = offerings.current.availablePackages.find(
            (pkg) => pkg.identifier === 'premium_monthly'
          );
          const proPackage = offerings.current.availablePackages.find(
            (pkg) => pkg.identifier === 'pro_monthly'
          );

          if (premiumPackage) {
            console.log('✅ Premium plan package found:', premiumPackage.identifier);
          } else {
            console.warn('⚠️ Premium plan package (premium_monthly) not found');
          }

          if (proPackage) {
            console.log('✅ Pro plan package found:', proPackage.identifier);
          } else {
            console.warn('⚠️ Pro plan package (pro_monthly) not found');
          }
        }
      } catch (err: any) {
        console.error('❌ RevenueCat init error:', err);
        setError(err.message || 'RevenueCat initialization failed');
      }
    };

    initPurchases();
  }, []);

  // Premium satın al
  const purchasePremium = async (): Promise<boolean> => {
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

      // Premium package'ı bul (identifier: premium_monthly)
      const premiumPackage = offering.availablePackages.find(
        (pkg) => pkg.identifier === 'premium_monthly'
      );

      if (!premiumPackage) {
        console.error('❌ Premium package not found. Available packages:', 
          offering.availablePackages.map(p => p.identifier));
        throw new Error('Premium paketi bulunamadı');
      }

      console.log('🛒 Purchasing Premium plan:', premiumPackage.identifier);

      // Satın alma işlemi
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
      setError(err.message || 'Premium plan satın alma başarısız');
      setIsLoading(false);
      return false;
    }
  };

  // Pro satın al
  const purchasePro = async (): Promise<boolean> => {
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

      // Pro package'ı bul (identifier: pro_monthly)
      const proPackage = offering.availablePackages.find(
        (pkg) => pkg.identifier === 'pro_monthly'
      );

      if (!proPackage) {
        console.error('❌ Pro package not found. Available packages:', 
          offering.availablePackages.map(p => p.identifier));
        throw new Error('Pro paketi bulunamadı');
      }

      console.log('🛒 Purchasing Pro plan:', proPackage.identifier);

      // Satın alma işlemi
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
      setError(err.message || 'Pro plan satın alma başarısız');
      setIsLoading(false);
      return false;
    }
  };

  // Satın almaları geri yükle
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