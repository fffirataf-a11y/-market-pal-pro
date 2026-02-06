import { useState, useEffect } from 'react';
import { Purchases, LOG_LEVEL, PurchasesOfferings, CustomerInfo } from '@revenuecat/purchases-capacitor';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

export type PurchaseStatus = 'idle' | 'loading' | 'success' | 'error';
export type PlanType = 'free' | 'premium' | 'pro';

interface UsePurchasesReturn {
  offerings: PurchasesOfferings | null;
  customerInfo: CustomerInfo | null;
  isLoading: boolean;
  isInitializing: boolean;
  isConfigured: boolean;
  error: string | null;
  purchasePremium: (period?: 'monthly' | 'yearly') => Promise<boolean>;
  purchasePro: (period?: 'monthly' | 'yearly') => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  checkActiveSubscription: () => PlanType;
  activePlan: PlanType;
}

const REVENUECAT_API_KEY = {
  ios: 'appl_pMUUgJTRkfJqIQXitaAgTgSSBLV',
  android: 'goog_VeKdfhekIaXDfJyinZIRpzlqHON',
};

export const usePurchases = (): UsePurchasesReturn => {
  const [activePlan, setActivePlan] = useState<PlanType>('free'); // ZORUNLU KURAL 3: DEFAULT FREE
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      // Safety guard against double-init
      if (isConfigured) return;

      const platform = Capacitor.getPlatform();
      console.log('[RevenueCat] 🎯 Platform:', platform);

      // WEB → ZORUNLU FREE
      if (!Capacitor.isNativePlatform()) {
        console.log('[RevenueCat] 🌐 WEB → FORCING FREE');
        setActivePlan('free');
        setIsInitializing(false);
        setIsConfigured(true);
        return;
      }

      try {
        // 1. Configure FIRST
        const apiKey = platform === 'ios' ? REVENUECAT_API_KEY.ios : REVENUECAT_API_KEY.android;

        try {
          await Purchases.configure({ apiKey });
          await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
        } catch (configErr: any) {
          // If already configured, just continue
          if (configErr.message && configErr.message.includes('configured')) {
            console.log('[RevenueCat] Already configured, continuing...');
          } else {
            throw configErr;
          }
        }

        // 2. Mark as Configured
        setIsConfigured(true);

        // 3. Now Safe to RESET IDENTITY (LogOut)
        // ... rest of logic
        try {
          await Purchases.logOut();
        } catch (logoutErr) {
          console.warn("[RevenueCat] Logout failed (non-fatal):", logoutErr);
        }

        console.log('[RevenueCat] 👤 Fetching customer info...');
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info.customerInfo);

        // Offerings (Optional but useful)
        try {
          const offers = await Purchases.getOfferings();
          setOfferings(offers);
        } catch (err) {
          console.warn('[RevenueCat] Failed to fetch offerings', err);
        }

        const ent = info.customerInfo.entitlements.active;
        let plan: PlanType = 'free';

        if (ent['pro']) {
          plan = 'pro';
        } else if (ent['premium']) {
          plan = 'premium';
        }

        console.log(`[RevenueCat] FINAL AUTHORITY → Updating global plan: ${plan}`);
        setActivePlan(plan);

      } catch (e: any) {
        console.error('[RevenueCat] ❌ ERROR → FREE', e);
        // Error handling forces FREE but DOES NOT THROW to App
        setActivePlan('free');
        setError(e.message || 'Initialization failed');
        // If init failed heavily, we might NOT be configured properly
        // But we set isConfigured=true only if we want to bypass checks, 
        // here we leave it or set false. Setting false is safer for preventing purchase attempts.
        setIsConfigured(false);
      } finally {
        setIsInitializing(false);
      }
    };

    // Call init safely
    initialize().catch(err => {
      console.error('[RevenueCat] Fatal Init Error caught:', err);
      setIsInitializing(false);
    });
  }, []);

  const { toast } = useToast(); // Import toast

  const purchasePackage = async (packageIdentifier: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!offerings?.current) {
        throw new Error('No offerings available');
      }

      const pkg = offerings.current.availablePackages.find(
        (p) => p.identifier === packageIdentifier
      );

      if (!pkg) {
        throw new Error('Package not found');
      }

      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      setCustomerInfo(customerInfo);

      // Update plan immediately after purchase
      const ent = customerInfo.entitlements.active;
      if (ent['pro']) setActivePlan('pro');
      else if (ent['premium']) setActivePlan('premium');

      return true;
    } catch (err: any) {
      if (err.message && err.message.includes("configured")) {
        console.error("Purchases not configured yet");
        // Auto-retry or just fail gracefully
      }

      // ✅ GLOBAL CANCELLATION FEEDBACK
      if (err.userCancelled) {
        console.log('[RevenueCat] User cancelled purchase');
        toast({
          title: "İptal Edildi", // Hardcoded per user preference for TR context usually, or use t() if available.
          // Since this hook doesn't have useTranslation loaded in the snippet I saw, let's check imports.
          // It doesn't have useTranslation. I will use generic English or try to add translation if easy.
          // Actually, let's stick to the plan: "Info" / "Purchase cancelled".
          // Better: Use a neutral message or check if I can use t().
          // Auth.tsx uses t. Settings.tsx uses t.
          // I'll stick to a safe hardcoded string or simple conditional if possible, 
          // but for now let's use a clear message.
          description: "Satın alma işlemi iptal edildi",
          variant: "destructive", // As requested "Hata ekranı gibi olsun"
        });
      } else {
        setError(err.message);
        console.error('[RevenueCat] Purchase failed:', err);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePremium = async (period: 'monthly' | 'yearly' = 'monthly') => {
    if (!isConfigured) {
      console.warn("Purchases NOT configured, cannot purchase.");
      return false;
    }
    // Updated to match Product IDs seen in screenshot (Premium_Monthly -> premium_monthly mapping)
    return purchasePackage(period === 'monthly' ? 'premium_monthly' : 'premium_yearly');
  }

  const purchasePro = async (period: 'monthly' | 'yearly' = 'monthly') => {
    if (!isConfigured) {
      console.warn("Purchases NOT configured, cannot purchase.");
      return false;
    }
    return purchasePackage(period === 'monthly' ? 'pro_monthly' : 'pro_yearly');
  }

  const restorePurchases = async (): Promise<boolean> => {
    if (isInitializing) {
      console.warn("Purchases initializing, waiting...");
      return false;
    }
    try {
      setIsLoading(true);
      setError(null);
      const { customerInfo } = await Purchases.restorePurchases();
      setCustomerInfo(customerInfo);

      // Update plan after restore
      const ent = customerInfo.entitlements.active;
      if (ent['pro']) setActivePlan('pro');
      else if (ent['premium']) setActivePlan('premium');
      else setActivePlan('free');

      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('[RevenueCat] Restore failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkActiveSubscription = () => activePlan;

  return {
    offerings,
    customerInfo,
    isLoading,
    isInitializing,
    isConfigured,
    error,
    purchasePremium,
    purchasePro,
    restorePurchases,
    checkActiveSubscription,
    activePlan
  };
};