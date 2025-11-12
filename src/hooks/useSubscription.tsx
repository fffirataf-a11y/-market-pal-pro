import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export type PlanType = 'free' | 'premium' | 'pro';

interface SubscriptionState {
  plan: PlanType;
  dailyLimit: number;
  dailyUsed: number;
  trialStartDate: string | null;
  trialEndDate: string | null;
  isTrialActive: boolean;
  lastResetDate: string;
  hasReferral: boolean;
  referralCode: string;
  referralCount: number; // Kaç kişi davet etti
  usedReferralCode: string | null;
  promoCodeUsed: string | null;
  hasUsedReferralButton: boolean; // Davet butonu kullanıldı mı?
}

const STORAGE_KEY_PREFIX = 'subscription_state_';

// Kullanıcı ID'sine göre storage key oluştur
const getStorageKey = (userId: string | null): string => {
  if (!userId) {
    return 'subscription_state_guest';
  }
  return `${STORAGE_KEY_PREFIX}${userId}`;
};

// Generate unique referral code (longer and more random)
const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SMART-';
  // Generate 12 random characters for longer code
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Check if date needs reset
const needsReset = (lastResetDate: string): boolean => {
  const today = new Date().toDateString();
  return lastResetDate !== today;
};

// Calculate trial end date
const calculateTrialEndDate = (startDate: Date, bonusDays: number = 0): Date => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7 + bonusDays); // 7 gün + bonus
  return endDate;
};

// Check if trial is still active
const isTrialStillActive = (trialEndDate: string | null): boolean => {
  if (!trialEndDate) return false;
  const now = new Date();
  const endDate = new Date(trialEndDate);
  return now < endDate;
};

export const useSubscription = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(auth.currentUser?.uid || null);
  
  // Auth state değişikliklerini dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid || null);
    });
    return unsubscribe;
  }, []);

  const [state, setState] = useState<SubscriptionState>(() => {
    // İlk render'da auth state henüz hazır olmayabilir, mevcut kullanıcıyı kontrol et
    const userId = auth.currentUser?.uid || null;
    const storageKey = getStorageKey(userId);
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Check if trial expired
      if (parsed.plan === 'free' && parsed.trialEndDate) {
        if (!isTrialStillActive(parsed.trialEndDate)) {
          // Trial süresi doldu - daily limit'i 0 yap
          return {
            ...parsed,
            isTrialActive: false,
            dailyLimit: 0,
            hasUsedReferralButton: parsed.hasUsedReferralButton ?? false,
          };
        }
      }
      
      // Check for referral bonuses from referral_states
      if (parsed.referralCode) {
        const referralStates = JSON.parse(localStorage.getItem('referral_states') || '{}');
        if (referralStates[parsed.referralCode]) {
          const storedState = referralStates[parsed.referralCode];
          // If stored state has a later trial end date, use it
          if (storedState.trialEndDate && parsed.trialEndDate) {
            const storedEndDate = new Date(storedState.trialEndDate);
            const currentEndDate = new Date(parsed.trialEndDate);
            if (storedEndDate > currentEndDate) {
              parsed.trialEndDate = storedState.trialEndDate;
              parsed.isTrialActive = storedState.isTrialActive;
            }
          }
          // Update referral count
          if (storedState.referralCount !== undefined) {
            parsed.referralCount = storedState.referralCount;
          }
        }
      }
      
      // Eski state'lerde hasUsedReferralButton olmayabilir, default false yap
      if (parsed.hasUsedReferralButton === undefined) {
        parsed.hasUsedReferralButton = false;
      }
      
      return parsed;
    }
    
    // Initial state for new users - Free trial başlat
    const now = new Date();
    const trialEnd = calculateTrialEndDate(now);
    
    return {
      plan: 'free' as PlanType,
      dailyLimit: 10,
      dailyUsed: 0,
      trialStartDate: now.toISOString(),
      trialEndDate: trialEnd.toISOString(),
      isTrialActive: true,
      lastResetDate: new Date().toDateString(),
      hasReferral: false,
      referralCode: generateReferralCode(),
      referralCount: 0,
      usedReferralCode: null,
      promoCodeUsed: null,
      hasUsedReferralButton: false,
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    const userId = auth.currentUser?.uid || null;
    const storageKey = getStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(state));
    
    // Register referral code in registry
    if (state.referralCode) {
      const referralRegistry = JSON.parse(localStorage.getItem('referral_registry') || '{}');
      referralRegistry[state.referralCode] = state.referralCode; // Store code owner
      localStorage.setItem('referral_registry', JSON.stringify(referralRegistry));
      
      // Store state for referral bonus
      const referralStates = JSON.parse(localStorage.getItem('referral_states') || '{}');
      referralStates[state.referralCode] = {
        plan: state.plan,
        trialEndDate: state.trialEndDate,
        isTrialActive: state.isTrialActive,
        referralCount: state.referralCount,
      };
      localStorage.setItem('referral_states', JSON.stringify(referralStates));
    }
  }, [state]);

  // Kullanıcı değiştiğinde state'i güncelle - yeni kullanıcı için free plan başlat
  useEffect(() => {
    if (currentUserId !== null) {
      const storageKey = getStorageKey(currentUserId);
      const saved = localStorage.getItem(storageKey);
      
      if (!saved) {
        // Yeni kullanıcı için free plan başlat
        const now = new Date();
        const trialEnd = calculateTrialEndDate(now);
        
        const newState: SubscriptionState = {
          plan: 'free' as PlanType,
          dailyLimit: 10,
          dailyUsed: 0,
          trialStartDate: now.toISOString(),
          trialEndDate: trialEnd.toISOString(),
          isTrialActive: true,
          lastResetDate: new Date().toDateString(),
          hasReferral: false,
          referralCode: generateReferralCode(),
          referralCount: 0,
          usedReferralCode: null,
          promoCodeUsed: null,
          hasUsedReferralButton: false,
        };
        
        setState(newState);
        localStorage.setItem(storageKey, JSON.stringify(newState));
      } else {
        // Mevcut kullanıcının state'ini yükle
        const parsed = JSON.parse(saved);
        setState(parsed);
      }
    } else {
      // Guest kullanıcı için free plan
      const storageKey = getStorageKey(null);
      const saved = localStorage.getItem(storageKey);
      
      if (!saved) {
        const now = new Date();
        const trialEnd = calculateTrialEndDate(now);
        
        const newState: SubscriptionState = {
          plan: 'free' as PlanType,
          dailyLimit: 10,
          dailyUsed: 0,
          trialStartDate: now.toISOString(),
          trialEndDate: trialEnd.toISOString(),
          isTrialActive: true,
          lastResetDate: new Date().toDateString(),
          hasReferral: false,
          referralCode: generateReferralCode(),
          referralCount: 0,
          usedReferralCode: null,
          promoCodeUsed: null,
          hasUsedReferralButton: false,
        };
        
        setState(newState);
      }
    }
  }, [currentUserId]);

  // Check and reset daily limits
  useEffect(() => {
    if (needsReset(state.lastResetDate)) {
      setState(prev => ({
        ...prev,
        dailyUsed: 0,
        lastResetDate: new Date().toDateString(),
      }));
    }

    // Check if trial expired
    if (state.plan === 'free' && state.isTrialActive && state.trialEndDate) {
      if (!isTrialStillActive(state.trialEndDate)) {
        setState(prev => ({
          ...prev,
          isTrialActive: false,
          dailyLimit: 0, // Trial bitti, kullanamaz
        }));
      }
    }
  }, [state.lastResetDate, state.plan, state.isTrialActive, state.trialEndDate]);

  const canPerformAction = (): boolean => {
    // Pro plan - sınırsız
    if (state.plan === 'pro') return true;
    
    // Free plan - trial kontrolü
    if (state.plan === 'free') {
      if (!state.isTrialActive) return false; // Trial bitti
      if (state.dailyUsed >= state.dailyLimit) return false; // Günlük limit doldu
      return true;
    }
    
    // Premium plan - günlük limit kontrolü
    if (state.plan === 'premium') {
      if (state.dailyUsed >= state.dailyLimit) return false;
      return true;
    }
    
    return false;
  };

  const incrementAction = () => {
    if (state.plan === 'pro') return; // Pro için saymaya gerek yok
    
    if (canPerformAction()) {
      setState(prev => ({
        ...prev,
        dailyUsed: prev.dailyUsed + 1,
      }));
    }
  };

  const getRemainingActions = (): number => {
    if (state.plan === 'pro') return -1; // Sınırsız için -1
    if (state.plan === 'free' && !state.isTrialActive) return 0; // Trial bitti
    return state.dailyLimit - state.dailyUsed;
  };

  const getTrialDaysRemaining = (): number => {
    if (state.plan !== 'free' || !state.trialEndDate) return 0;
    
    const now = new Date();
    const endDate = new Date(state.trialEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const applyReferralCode = (code: string): boolean => {
    if (state.usedReferralCode) {
      return false; // Already used a referral
    }

    if (state.plan !== 'free') {
      return false; // Only free users can use referral
    }

    // Validate code format (SMART-XXXXXXXXXXXX = 18 characters)
    if (!code.startsWith('SMART-') || code.length !== 18) {
      return false;
    }

    // Check if code exists in referral registry
    const referralRegistry = JSON.parse(localStorage.getItem('referral_registry') || '{}');
    
    if (!referralRegistry[code]) {
      return false; // Code doesn't exist
    }

    // +7 gün bonus ekle (kod kullanan kişiye)
    const currentEndDate = new Date(state.trialEndDate || new Date());
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + 7);
    
    setState(prev => ({
      ...prev,
      usedReferralCode: code,
      trialEndDate: newEndDate.toISOString(),
      isTrialActive: true,
      // Limit değişmez, sadece süre uzar
    }));

    // Davet eden kullanıcıya +7 gün ekle
    const referrerCode = referralRegistry[code];
    if (referrerCode && referrerCode !== state.referralCode) {
      // Find referrer's subscription state and add 7 days
      const allStates = JSON.parse(localStorage.getItem('referral_states') || '{}');
      if (allStates[referrerCode]) {
        const referrerState = allStates[referrerCode];
        if (referrerState.plan === 'free' && referrerState.trialEndDate) {
          const referrerEndDate = new Date(referrerState.trialEndDate);
          referrerEndDate.setDate(referrerEndDate.getDate() + 7);
          // Sadece +7 gün ekle, limit değişmez
          allStates[referrerCode] = {
            ...referrerState,
            trialEndDate: referrerEndDate.toISOString(),
            isTrialActive: true,
            referralCount: (referrerState.referralCount || 0) + 1,
            // Limit değişmez
          };
          localStorage.setItem('referral_states', JSON.stringify(allStates));
          
          // Eğer davet eden kullanıcı şu anda aktifse (aynı tarayıcıda), onun state'ini de güncelle
          const currentUserId = auth.currentUser?.uid || null;
          const currentStorageKey = getStorageKey(currentUserId);
          const currentState = JSON.parse(localStorage.getItem(currentStorageKey) || '{}');
          if (currentState.referralCode === referrerCode) {
            setState(prev => ({
              ...prev,
              trialEndDate: referrerEndDate.toISOString(),
              isTrialActive: true,
              referralCount: (prev.referralCount || 0) + 1,
              // Limit değişmez
            }));
          }
        }
      }
    }

    return true;
  };

  const shareReferralCode = (): void => {
    // Her paylaşımda +7 gün bonus (gerçekte backend'de kontrol edilmeli)
    if (state.plan === 'free' && state.trialEndDate) {
      const currentEndDate = new Date(state.trialEndDate);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setDate(newEndDate.getDate() + 7);
      
      setState(prev => ({
        ...prev,
        referralCount: prev.referralCount + 1,
        trialEndDate: newEndDate.toISOString(),
        isTrialActive: true,
      }));
    }
  };

  const upgradeToPremium = () => {
    setState(prev => ({
      ...prev,
      plan: 'premium',
      dailyLimit: 30,
      dailyUsed: 0,
      trialStartDate: null,
      trialEndDate: null,
      isTrialActive: false,
    }));
  };

  const upgradeToPro = () => {
    setState(prev => ({
      ...prev,
      plan: 'pro',
      dailyLimit: -1, // Sınırsız
      dailyUsed: 0,
      trialStartDate: null,
      trialEndDate: null,
      isTrialActive: false,
    }));
  };

  const getUsagePercentage = (): number => {
    if (state.plan === 'pro') return 0; // Sınırsız
    if (state.dailyLimit === 0) return 100; // Trial bitti
    return Math.round((state.dailyUsed / state.dailyLimit) * 100);
  };
  const applyPromoCode = async (code: string): Promise<{
    success: boolean;
    message: string;
    plan?: PlanType;
  }> => {
    try {
      // 1. Kullanıcı daha önce promo code kullandı mı?
      if (state.promoCodeUsed) {
        return { 
          success: false, 
          message: 'Daha önce bir promosyon kodu kullandınız' 
        };
      }

      // 1.5 Auth kontrolü
      console.log('🔍 Current auth state:', auth.currentUser);
      if (!auth.currentUser) {
        return { 
          success: false, 
          message: 'Önce giriş yapmalısınız' 
        };
      }

      // 2. Promo code'u Firestore'dan kontrol et
      console.log('📥 Fetching promo code:', code);
      const promoRef = doc(db, 'PromoCodes', code);
      const promoSnap = await getDoc(promoRef);

      if (!promoSnap.exists()) {
        return { success: false, message: 'Geçersiz promosyon kodu' };
      }

      const promoData = promoSnap.data();

      // 3. Kod kontrolü
      if (!promoData.isActive) {
        return { success: false, message: 'Bu kod artık aktif değil' };
      }

      if (promoData.usedCount >= promoData.maxUses) {
        return { success: false, message: 'Bu kod kullanım limitine ulaştı' };
      }

      if (promoData.expiresAt && new Date() > promoData.expiresAt.toDate()) {
        return { success: false, message: 'Bu kodun süresi dolmuş' };
      }

      // 4. Kullanım sayısını artır
      await updateDoc(promoRef, {
        usedCount: increment(1),
      });

      // 5. Kullanıcıya premium/pro ver
      const planType = promoData.type as PlanType;
      const durationDays = promoData.durationDays;

      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + durationDays);

      setState(prev => ({
        ...prev,
        plan: planType,
        dailyLimit: planType === 'pro' ? -1 : 30,
        dailyUsed: 0,
        trialStartDate: now.toISOString(),
        trialEndDate: endDate.toISOString(),
        isTrialActive: true,
        promoCodeUsed: code,
      }));

      return {
        success: true,
        message: `${planType.toUpperCase()} plan ${durationDays} gün boyunca aktif!`,
        plan: planType,
      };
    } catch (error) {
      console.error('Promo code error:', error);
      return { success: false, message: 'Bir hata oluştu' };
    }
  };

  const regenerateReferralCode = (): void => {
    const newCode = generateReferralCode();
    setState(prev => ({
      ...prev,
      referralCode: newCode,
      // hasUsedReferralButton değiştirme - her zaman yeni kod üretilebilsin
    }));
  };

  return {
    // State values
    plan: state.plan,
    dailyLimit: state.dailyLimit,
    dailyUsed: state.dailyUsed,
    isTrialActive: state.isTrialActive,
    referralCode: state.referralCode,
    referralCount: state.referralCount,
    usedReferralCode: state.usedReferralCode,
    promoCodeUsed: state.promoCodeUsed,
    hasUsedReferralButton: state.hasUsedReferralButton,
    
    // Functions
    canPerformAction,
    incrementAction,
    getRemainingActions,
    getTrialDaysRemaining,
    getUsagePercentage,
    applyReferralCode,
    shareReferralCode,
    regenerateReferralCode,
    upgradeToPremium,
    upgradeToPro,
    applyPromoCode,
  };
};