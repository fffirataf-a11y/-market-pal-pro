import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlanType } from '../types/subscription';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, increment, onSnapshot, setDoc, deleteField } from 'firebase/firestore';

export interface SubscriptionState {
    plan: PlanType;
    startDate?: string;
    trialEndDate: string | null;
    isTrialActive: boolean;
    dailyLimit: number;
    dailyUsed: number;
    lastResetDate: string;
    referralCode?: string;
    referredBy?: string;
    referralCount: number;
    bonusDays?: number;
    hasUsedReferralButton: boolean;
    adRewardCount: number;
    trialStartDate?: string | null;
    hasReferral?: boolean;
    usedReferralCode?: string | null;
    promoCodeUsed?: string | null;
    subscriptionEndDate?: string | null;
    lastAdWatchTime?: string | null;
}

interface SubscriptionContextType {
    plan: PlanType;
    dailyLimit: number;
    dailyUsed: number;
    isTrialActive: boolean;
    referralCode?: string;
    referralCount: number;
    usedReferralCode?: string | null;
    promoCodeUsed?: string | null;
    hasUsedReferralButton: boolean;
    adRewardCount: number;
    subscriptionEndDate?: string | null;

    canPerformAction: () => boolean;
    incrementAction: () => void;
    getRemainingActions: () => number;
    getUsagePercentage: () => number;
    getDaysRemaining: () => number;
    getTrialDaysRemaining: () => number;
    applyReferralCode: (code: string) => Promise<{ success: boolean; message: string }>;
    shareReferralCode: () => void;
    regenerateReferralCode: () => void;
    upgradeToPremium: (period: 'monthly' | 'yearly', expirationDateOverride?: string) => void;
    upgradeToPro: (period: 'monthly' | 'yearly', expirationDateOverride?: string) => void;
    downgradeToFree: () => void;
    applyPromoCode: (code: string) => Promise<{ success: boolean; message: string; plan?: PlanType }>;
    rewardAdWatched: () => { success: boolean; message: string };
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'subscription_state_';

const getStorageKey = (userId: string | null) => {
    return userId ? `${STORAGE_KEY_PREFIX}${userId}` : 'subscription_state_guest';
};

const generateReferralCode = () => {
    return 'SMART-' + Math.random().toString(36).substring(2, 14).toUpperCase();
};

const checkIfNewDay = (lastResetDate: string): boolean => {
    const today = new Date().toDateString();
    return lastResetDate !== today;
};

const calculateTrialEndDate = (startDate: Date, bonusDays: number = 0): Date => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7 + bonusDays);
    return endDate;
};

const isTrialStillActive = (trialEndDate: string | null): boolean => {
    if (!trialEndDate) return false;
    const now = new Date();
    const endDate = new Date(trialEndDate);
    return now < endDate;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
    const [currentUserId, setCurrentUserId] = useState<string | null>(auth.currentUser?.uid || null);
    const [isLoading, setIsLoading] = useState(true); // Loading state ekledik

    useEffect(() => {
        // Timeout - 3 saniye içinde auth bilgisi gelmezse devam et
        const timeout = setTimeout(() => {
            console.warn('[SubscriptionContext] Auth timeout - forcing continue');
            setIsLoading(false);
        }, 3000);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            clearTimeout(timeout);
            setCurrentUserId(user?.uid || null);
            if (!user) setIsLoading(false);
        });
        return () => {
            clearTimeout(timeout);
            unsubscribe();
        };
    }, []);

    const [state, setState] = useState<SubscriptionState>(() => {
        // Başlangıç state'i (Offline/Guest için)
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
            adRewardCount: 0,
            lastAdWatchTime: null,
            subscriptionEndDate: null,
        };
    });

    // Firestore Sync Logic
    useEffect(() => {
        if (!currentUserId) {
            // Guest Modu: LocalStorage kullanmaya devam et
            const storageKey = getStorageKey(null);
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setState(parsed);
                } catch (e) { console.error(e); }
            }
            setIsLoading(false);
            return;
        }

        // Logged In User: Firestore Listener
        const userRef = doc(db, 'users', currentUserId);

        // Real-time listener
        const unsubscribeSnapshot = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                // Firestore'da abonelik verisi var mı kontrol et
                if (data.subscription) {
                    const subData = data.subscription as SubscriptionState;

                    // Tarih kontrolü ve state güncelleme
                    // Eğer deneme süresi bittiyse ve hala active görünüyorsa düzelt
                    let isTrialActive = subData.isTrialActive;
                    let plan = subData.plan;
                    let dailyLimit = subData.dailyLimit;

                    // 1. Check Trial Expiration
                    if (isTrialActive && subData.trialEndDate) {
                        if (!isTrialStillActive(subData.trialEndDate)) {
                            console.log("Context: Trial Expired");
                            isTrialActive = false;
                            plan = 'free';
                            dailyLimit = 0; // Expired = 0

                            // Immediately update DB
                            await updateDoc(userRef, {
                                'subscription.isTrialActive': false,
                                'subscription.plan': 'free',
                                'subscription.dailyLimit': 0
                            });
                        }
                    }

                    // 2. Check Paid/Promo Subscription Expiration
                    // If plan is NOT free, check if subscriptionEndDate has passed
                    if (plan !== 'free' && subData.subscriptionEndDate) {
                        const endDate = new Date(subData.subscriptionEndDate);
                        const now = new Date();
                        if (endDate < now) {
                            console.log("Context: Subscription/Promo Expired");
                            plan = 'free';
                            dailyLimit = 0; // Expired = 0

                            // Immediately downgrade in DB
                            await updateDoc(userRef, {
                                'subscription.plan': 'free',
                                'subscription.dailyLimit': 0,
                                'subscription.subscriptionEndDate': null, // Clear end date
                                'subscription.promoCodeUsed': deleteField() // Clear promo if used
                            });
                        }
                    }

                    // Günlük Limit Reset Kontrolü (DB'de saklanan lastResetDate ile)
                    if (checkIfNewDay(subData.lastResetDate)) {
                        let newLimit = 0;
                        if (plan === 'pro') newLimit = -1;
                        else if (plan === 'premium') newLimit = 30;
                        else if (plan === 'free' && isTrialActive) newLimit = 10;
                        else newLimit = 0; // Free + Expired = 0

                        await updateDoc(userRef, {
                            'subscription.dailyUsed': 0,
                            'subscription.adRewardCount': 0,
                            'subscription.dailyLimit': newLimit,
                            'subscription.lastResetDate': new Date().toDateString()
                        });
                        // State update listener'dan gelecek
                    } else {
                        setState(subData);
                    }
                } else {
                    // Kullanıcı var ama subscription objesi yok (Eski kullanıcı veya yeni kayıt)
                    // LocalStorage'dan migrate et veya yeni oluştur
                    const storageKey = getStorageKey(currentUserId);
                    const localSaved = localStorage.getItem(storageKey);

                    let initialSub: SubscriptionState;

                    if (localSaved) {
                        try {
                            initialSub = JSON.parse(localSaved);
                        } catch {
                            // Parse hatası, default oluştur
                            const now = new Date();
                            initialSub = {
                                plan: 'free',
                                dailyLimit: 10,
                                dailyUsed: 0,
                                trialStartDate: now.toISOString(),
                                trialEndDate: calculateTrialEndDate(now).toISOString(),
                                isTrialActive: true,
                                lastResetDate: new Date().toDateString(),
                                hasReferral: false,
                                referralCode: generateReferralCode(),
                                referralCount: 0,
                                usedReferralCode: null,
                                promoCodeUsed: null,
                                hasUsedReferralButton: false,
                                adRewardCount: 0,
                                lastAdWatchTime: null,
                            };
                        }
                    } else {
                        const now = new Date();
                        initialSub = {
                            plan: 'free',
                            dailyLimit: 10,
                            dailyUsed: 0,
                            trialStartDate: now.toISOString(),
                            trialEndDate: calculateTrialEndDate(now).toISOString(),
                            isTrialActive: true,
                            lastResetDate: new Date().toDateString(),
                            hasReferral: false,
                            referralCode: generateReferralCode(),
                            referralCount: 0,
                            usedReferralCode: null,
                            promoCodeUsed: null,
                            hasUsedReferralButton: false,
                            adRewardCount: 0,
                            lastAdWatchTime: null,
                        };
                    }

                    // Firestore'a ilk kez yaz
                    await updateDoc(userRef, {
                        subscription: initialSub
                    }).catch(async (err) => {
                        // Eğer döküman yoksa setDoc gerekir (nadir durum)
                        console.error("Error updating sub, trying setDoc fallback", err);
                    });
                }
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Firestore subscription sync error:", error);
            setIsLoading(false);
        });

        return () => unsubscribeSnapshot();
    }, [currentUserId]);

    const getDaysRemaining = (): number => {
        const endDateString = state.plan === 'free' ? state.trialEndDate : state.subscriptionEndDate;
        if (!endDateString) return 0;

        const now = new Date();
        const endDate = new Date(endDateString);

        // Ensure we don't return negative
        if (now > endDate) return 0;

        const diffTime = endDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const isExpired = getDaysRemaining() === 0;

    const currentDailyLimit = state.plan === 'pro' ? -1 : (
        state.plan === 'premium' ? 30 : (
            // If trial active, 10. If not (expired/free-tier-only), 0 in theory, 
            // but we rely on state.dailyLimit to be accurate.
            10 // Base limit for display/reference if needed, but strict limit comes from state
        )
    );

    const canPerformAction = (): boolean => {
        // if (isExpired) return false; // REMOVED: Allow Ad rewards to work
        if (state.plan === 'pro') return true;

        // Use state.dailyLimit which includes Ad Rewards
        return state.dailyUsed < state.dailyLimit;
    };

    const getRemainingActions = (): number => {
        // if (isExpired) return 0; // REMOVED: Allow Ad rewards to work
        if (state.plan === 'pro') return -1;
        return Math.max(0, state.dailyLimit - state.dailyUsed);
    };

    const getUsagePercentage = (): number => {
        // if (isExpired) return 100; // REMOVED: Allow Ad rewards to work
        if (state.plan === 'pro') return 0;
        if (state.dailyLimit === 0) return 100;
        return (state.dailyUsed / state.dailyLimit) * 100;
    };

    // Actions update Firestore now
    const incrementAction = async () => {
        if (canPerformAction() && currentUserId) {
            const userRef = doc(db, 'users', currentUserId);
            // Optimistic UI update (State'i hemen güncelle, DB arkadan gelir)
            setState(prev => ({ ...prev, dailyUsed: prev.dailyUsed + 1 }));

            await updateDoc(userRef, {
                'subscription.dailyUsed': increment(1)
            });
        } else if (canPerformAction() && !currentUserId) {
            // Guest logic
            setState(prev => {
                const next = { ...prev, dailyUsed: prev.dailyUsed + 1 };
                localStorage.setItem(getStorageKey(null), JSON.stringify(next));
                return next;
            });
        }
    };

    const upgradeToPremium = async (period: 'monthly' | 'yearly', expirationDateOverride?: string) => {
        let endDateString = expirationDateOverride;

        if (!endDateString) {
            const now = new Date();
            const endDate = new Date();
            if (period === 'monthly') {
                endDate.setDate(now.getDate() + 30);
            } else {
                endDate.setDate(now.getDate() + 365);
            }
            endDateString = endDate.toISOString();
        }

        setState(prev => ({
            ...prev,
            plan: 'premium',
            dailyLimit: 30,
            dailyUsed: 0,
            trialStartDate: null,
            trialEndDate: null,
            isTrialActive: false,
            subscriptionEndDate: endDateString
        }));
        if (currentUserId) {
            await updateDoc(doc(db, 'users', currentUserId), {
                'subscription.plan': 'premium',
                'subscription.dailyLimit': 30,
                'subscription.isTrialActive': false,
                'subscription.trialEndDate': null,
                'subscription.subscriptionEndDate': endDateString
            });
        }
    };

    const upgradeToPro = async (period: 'monthly' | 'yearly', expirationDateOverride?: string) => {
        let endDateString = expirationDateOverride;

        if (!endDateString) {
            const now = new Date();
            const endDate = new Date();
            if (period === 'monthly') {
                endDate.setDate(now.getDate() + 30);
            } else {
                endDate.setDate(now.getDate() + 365);
            }
            endDateString = endDate.toISOString();
        }

        setState(prev => ({
            ...prev,
            plan: 'pro',
            dailyLimit: -1,
            dailyUsed: 0,
            trialStartDate: null,
            trialEndDate: null,
            isTrialActive: false,
            subscriptionEndDate: endDateString
        }));
        if (currentUserId) {
            await updateDoc(doc(db, 'users', currentUserId), {
                'subscription.plan': 'pro',
                'subscription.dailyLimit': -1,
                'subscription.isTrialActive': false,
                'subscription.trialEndDate': null,
                'subscription.subscriptionEndDate': endDateString
            });
        }
    };

    const applyPromoCode = async (code: string): Promise<{ success: boolean; message: string; plan?: PlanType }> => {
        try {
            if (state.promoCodeUsed) {
                return { success: false, message: 'Daha önce bir promosyon kodu kullandınız' };
            }
            if (!auth.currentUser) {
                return { success: false, message: 'Önce giriş yapmalısınız' };
            }

            const promoRef = doc(db, 'PromoCodes', code);
            const promoSnap = await getDoc(promoRef);

            if (!promoSnap.exists()) {
                return { success: false, message: 'Geçersiz promosyon kodu' };
            }

            const promoData = promoSnap.data();

            if (!promoData.isActive) {
                return { success: false, message: 'Bu kod artık aktif değil' };
            }
            if (promoData.usedCount >= promoData.maxUses) {
                return { success: false, message: 'Bu kod kullanım limitine ulaştı' };
            }
            if (promoData.expiresAt && new Date() > promoData.expiresAt.toDate()) {
                return { success: false, message: 'Bu kodun süresi dolmuş' };
            }

            await updateDoc(promoRef, {
                usedCount: increment(1),
            });

            const planType = promoData.type as PlanType;
            const durationDays = promoData.durationDays;
            const now = new Date();
            const endDate = new Date(now);
            endDate.setDate(endDate.getDate() + durationDays);

            // First Update Firestore (Critical Step)
            // If this fails, we should NOT update local state
            if (currentUserId) {
                try {
                    await setDoc(doc(db, 'users', currentUserId), {
                        subscription: {
                            plan: planType,
                            dailyLimit: planType === 'pro' ? -1 : 30,
                            isTrialActive: false,
                            trialEndDate: null,
                            subscriptionEndDate: endDate.toISOString(),
                            promoCodeUsed: code
                        }
                    }, { merge: true });
                } catch (dbError: any) {
                    console.error("Promo DB Error:", dbError);
                    return { success: false, message: `DB Hatası: ${dbError.message || 'Veritabanına yazılamadı'}` };
                }
            }

            // Update State (Only if DB update succeeded)
            setState(prev => ({
                ...prev,
                plan: planType,
                dailyLimit: planType === 'pro' ? -1 : 30,
                dailyUsed: 0,
                trialStartDate: null,
                trialEndDate: null,
                isTrialActive: false, // It is NOT a trial, it is a full subscription via promo
                subscriptionEndDate: endDate.toISOString(), // Set the REAL end date
                promoCodeUsed: code,
            }));

            return {
                success: true,
                message: `${planType.toUpperCase()} plan ${durationDays} gün boyunca aktif!`,
                plan: planType,
            };
        } catch (error: any) {
            console.error('Promo code error:', error);
            return { success: false, message: `Hata: ${error.message || 'Bir hata oluştu'}` };
        }
    };

    const regenerateReferralCode = (): void => {
        const newCode = generateReferralCode();
        setState(prev => ({
            ...prev,
            referralCode: newCode,
        }));
        if (currentUserId) {
            updateDoc(doc(db, 'users', currentUserId), {
                'subscription.referralCode': newCode
            });
        }
    };

    const shareReferralCode = (): void => {
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

            if (currentUserId) {
                updateDoc(doc(db, 'users', currentUserId), {
                    'subscription.referralCount': increment(1),
                    'subscription.trialEndDate': newEndDate.toISOString()
                });
            }
        }
    };

    const applyReferralCode = async (code: string): Promise<{ success: boolean; message: string }> => {
        // 1. Check Promo Code first
        const promoResult = await applyPromoCode(code);
        if (promoResult.success) {
            return { success: true, message: promoResult.message };
        }
        if (promoResult.message !== 'Geçersiz promosyon kodu') {
            return { success: false, message: promoResult.message };
        }

        // 2. Fallback to Referral Logic
        // For simplicity in this fix, we are trusting the local registry check again, 
        // as we haven't migrated the global referral registry to Firestore yet.
        // This keeps existing functionality working.
        if (state.usedReferralCode) {
            return { success: false, message: 'Daha önce bir davet kodu kullandınız.' };
        }

        const referralRegistry = JSON.parse(localStorage.getItem('referral_registry') || '{}');
        if (!referralRegistry[code]) {
            return { success: false, message: 'Davet kodu bulunamadı.' };
        }

        const currentEndDate = new Date(state.trialEndDate || new Date());
        const newEndDate = new Date(currentEndDate);
        newEndDate.setDate(newEndDate.getDate() + 7);

        setState(prev => ({
            ...prev,
            usedReferralCode: code,
            trialEndDate: newEndDate.toISOString(),
            isTrialActive: true,
        }));

        if (currentUserId) {
            await updateDoc(doc(db, 'users', currentUserId), {
                'subscription.usedReferralCode': code,
                'subscription.trialEndDate': newEndDate.toISOString(),
                'subscription.isTrialActive': true
            });
        }

        return { success: true, message: 'Davet kodu başarıyla uygulandı! Deneme süreniz +7 gün uzatıldı.' };
    };

    const rewardAdWatched = (): { success: boolean; message: string } => {
        if (state.plan !== 'free') {
            return { success: false, message: 'Bu özellik sadece ücretsiz plandaki kullanıcılar içindir.' };
        }

        // Basic cooldown check implementation if needed again here, 
        // but reliance on LimitReachedDialog logic is preferred. 
        // For now, simple increment.

        setState(prev => ({
            ...prev,
            dailyLimit: prev.dailyLimit + 3,
            adRewardCount: prev.adRewardCount + 1,
            lastAdWatchTime: new Date().toISOString(),
        }));

        if (currentUserId) {
            const userRef = doc(db, 'users', currentUserId);
            updateDoc(userRef, {
                'subscription.dailyLimit': increment(3),
                'subscription.adRewardCount': increment(1),
                'subscription.lastAdWatchTime': new Date().toISOString()
            });
        }
        return { success: true, message: 'Reklam izlendi! +3 hak eklendi.' };
    };

    const downgradeToFree = async () => {
        // Downgrade to "Limited Free" (0 actions until ad watch)
        setState(prev => ({ ...prev, plan: 'free', dailyLimit: 0 }));
        if (currentUserId) {
            const userRef = doc(db, 'users', currentUserId);
            await updateDoc(userRef, {
                'subscription.plan': 'free',
                'subscription.dailyLimit': 0
            });
        }
    };

    const value = {
        plan: state?.plan || 'free',
        dailyLimit: state?.dailyLimit ?? 10,
        dailyUsed: state?.dailyUsed ?? 0,
        isTrialActive: state?.isTrialActive ?? false,
        referralCode: state?.referralCode,
        referralCount: state?.referralCount ?? 0,
        usedReferralCode: state?.usedReferralCode,
        promoCodeUsed: state?.promoCodeUsed,
        hasUsedReferralButton: state?.hasUsedReferralButton ?? false,
        adRewardCount: state?.adRewardCount ?? 0,
        subscriptionEndDate: state?.subscriptionEndDate,
        canPerformAction,
        incrementAction,
        getRemainingActions,
        getUsagePercentage,
        getDaysRemaining,
        getTrialDaysRemaining: getDaysRemaining,
        applyReferralCode,
        shareReferralCode,
        regenerateReferralCode,
        upgradeToPremium,
        upgradeToPro,
        downgradeToFree,
        applyPromoCode,
        rewardAdWatched,
    };

    // REMOVED: Blocking return null - bu satır app'in açılmamasına neden oluyordu
    // if (isLoading) return null; 

    return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};
