import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { BottomNav } from "@/components/BottomNav";
import { Label } from "@/components/ui/label";
import { useNotifications } from "@/hooks/useNotifications";
import { useFriends } from "@/hooks/useFriends";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Globe,
  Moon,
  Sun,
  Bell,
  LogOut,
  Check,
  Mail,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { usePurchases } from "@/hooks/usePurchases";
import { Capacitor } from "@capacitor/core";
import { UsageCard } from "@/components/UsageCard";
import RewardedAdSlot from "@/components/ads/RewardedAdSlot";

const Settings = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { friendRequests } = useFriends();
  const {
    plan: currentPlan,
    upgradeToPremium,
    upgradeToPro,
    downgradeToFree,
    getTrialDaysRemaining,
    isTrialActive,
    applyPromoCode,
    promoCodeUsed,
    rewardAdWatched,
    subscriptionEndDate,
  } = useSubscription();
  const {
    purchasePremium,
    purchasePro,
    restorePurchases,
    customerInfo,
    isLoading: purchaseLoading,
    error: purchaseError,
    offerings,
  } = usePurchases();
  const { permission, loading: notificationLoading, requestPermission } = useNotifications();
  const [notifications, setNotifications] = useState(true);
  const [subscriptionPlansOpen, setSubscriptionPlansOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const isYearly = billingCycle === 'yearly';

  // User data state
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.avatar || parsed.avatar === "") {
        parsed.avatar = "https://api.dicebear.com/9.x/micah/svg?seed=Easton&radius=50&backgroundColor=b6e3f4"
      }
      return parsed;
    }

    return {
      name: "Guest User",
      email: "guest@smartmarket.app",
      avatar: "https://api.dicebear.com/9.x/micah/svg?seed=SmartMarket&backgroundColor=b6e3f4,c0aede,ffd5dc&radius=50"
    };
  });

  // Listen for user data changes
  useEffect(() => {
    const handleUserDataChange = () => {
      const saved = localStorage.getItem("user");
      if (saved) {
        setUserData(JSON.parse(saved));
      }
    };

    window.addEventListener("user-data-change", handleUserDataChange);
    return () => window.removeEventListener("user-data-change", handleUserDataChange);
  }, []);

  // Purchase error handling
  useEffect(() => {
    if (purchaseError) {
      toast({
        title: "Satın alma hatası",
        description: purchaseError,
        variant: "destructive",
      });
    }
  }, [purchaseError, toast]);

  // Sync RevenueCat state with local state (Upgrades & Downgrades)
  useEffect(() => {
    if (!customerInfo) return;

    const premiumEntitlement = customerInfo.entitlements.active['premium'];
    const proEntitlement = customerInfo.entitlements.active['pro'];

    const isPremiumActive = !!premiumEntitlement;
    const isProActive = !!proEntitlement;

    // 1. Handle Upgrades / Sync
    if (isPremiumActive && (currentPlan !== 'premium' || !subscriptionEndDate)) { // Using context value
      console.log("🔄 Sync: Upgrading/Syncing Premium from RevenueCat");
      const expirationDate = premiumEntitlement.expirationDate;
      const productIdentifier = premiumEntitlement.productIdentifier;
      const isYearly = productIdentifier.includes('yearly') || productIdentifier.includes('annual');

      upgradeToPremium(isYearly ? 'yearly' : 'monthly', expirationDate || undefined);

    } else if (isProActive && (currentPlan !== 'pro' || !subscriptionEndDate)) {
      console.log("🔄 Sync: Upgrading/Syncing Pro from RevenueCat");
      const expirationDate = proEntitlement.expirationDate;
      const productIdentifier = proEntitlement.productIdentifier;
      const isYearly = productIdentifier.includes('yearly') || productIdentifier.includes('annual');

      upgradeToPro(isYearly ? 'yearly' : 'monthly', expirationDate || undefined);
    }

    // 2. Handle Expiration/Downgrades
    // If we are on a paid plan LOCALLY, but RevenueCat says NO active entitlements -> Downgrade
    // UNLESS a promo code is active
    if ((currentPlan === 'premium' || currentPlan === 'pro') && !isPremiumActive && !isProActive && !promoCodeUsed) {
      console.log("⚠️ Sync: Subscription Expired. Downgrading to Free.");
      downgradeToFree();
    }
  }, [customerInfo, currentPlan, upgradeToPremium, upgradeToPro, downgradeToFree, subscriptionEndDate, promoCodeUsed]);

  const handleRestore = async () => {
    try {
      const success = await restorePurchases();
      if (success) {
        toast({
          title: t('common.success'),
          description: i18n.language === 'tr'
            ? 'Satın alımlar başarıyla geri yüklendi'
            : 'Purchases restored successfully',
        });
      } else {
        toast({
          title: i18n.language === 'tr' ? 'Bilgi' : 'Info',
          description: i18n.language === 'tr'
            ? 'Aktif abonelik bulunamadı'
            : 'No active subscription found',
        });
      }
    } catch (error: any) {
      toast({
        title: i18n.language === 'tr' ? 'Hata' : 'Error',
        description: error.message || 'Failed to restore purchases',
        variant: "destructive",
      });
    }
  };

  const handleLanguageChange = (value: string) => {
    const messages: Record<string, string> = {
      en: "Language changed to English",
      tr: "Dil Türkçe olarak değiştirildi",
      ja: "言語が日本語に変更されました",
      ko: "언어가 한국어로 변경되었습니다",
      de: "Sprache wurde auf Deutsch umgestellt",
      fr: "La langue a été changée en français",
    };

    i18n.changeLanguage(value);
    localStorage.setItem("language", value);
    toast({
      title: t('common.success'),
      description: messages[value] ?? "Language preference updated",
    });
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (checked && permission !== 'granted') {
      await requestPermission();
    }
    setNotifications(checked && permission === 'granted');
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));

    toast({
      title: t('common.success'),
      description: "Logged out successfully",
    });

    navigate("/auth", { replace: true });
  };

  // RevenueCat paketlerini bul
  const currentOffering = offerings?.current;

  // Debug log for available packages
  console.log('📦 Available Packages:', currentOffering?.availablePackages.map(p => p.identifier));

  // Determine active product ID from RevenueCat
  const activeProductId = customerInfo?.entitlements.active['premium']?.productIdentifier
    || customerInfo?.entitlements.active['pro']?.productIdentifier;

  // Helper to find yearly package regardless of exact ID
  const findYearlyPackage = (baseId: string) => {
    // 1. Exact matches (Standard RevenueCat IDs)
    const exactMatch = currentOffering?.availablePackages.find(p =>
      p.identifier === `${baseId}_yearly` ||
      p.identifier === `${baseId}_annual`
    );
    if (exactMatch) return exactMatch;

    // 2. Loose match: Find ANY package with 'year' or 'annual' that also contains the baseId
    const looseMatch = currentOffering?.availablePackages.find(p =>
      p.identifier.includes(baseId) && (p.identifier.includes('year') || p.identifier.includes('annual'))
    );

    if (looseMatch) {
      console.log(`✅ Fuzzy found yearly package for ${baseId}:`, looseMatch.identifier);
      return looseMatch;
    }

    // 3. Last resort: If there are only 2 packages for this product, pick the one that ISN'T monthly
    const productPackages = currentOffering?.availablePackages.filter(p => p.identifier.includes(baseId)) || [];
    if (productPackages.length === 2) {
      return productPackages.find(p => !p.identifier.includes('month'));
    }

    return null;
  };

  const premiumMonthly = currentOffering?.availablePackages.find(p => p.identifier === 'premium_monthly');
  const premiumYearly = findYearlyPackage('premium');

  const proMonthly = currentOffering?.availablePackages.find(p => p.identifier === 'pro_monthly');
  const proYearly = findYearlyPackage('pro');



  const subscriptionPlans = [
    {
      id: 'free',
      name: t('subscription.free.name'),
      price: t('subscription.free.price'),
      dailyLimit: t('subscription.free.dailyLimit'),
      features: t('subscription.free.features', { returnObjects: true }) as string[],
      current: currentPlan === 'free',
      trialDays: getTrialDaysRemaining(),
      isTrialActive: isTrialActive,
    },
    {
      id: 'premium',
      name: t('subscription.premium.name'),
      price: isYearly
        ? (premiumYearly?.product.priceString || '')
        : (premiumMonthly?.product.priceString || ''),
      yearlyPrice: premiumYearly?.product.priceString || '',
      dailyLimit: t('subscription.premium.dailyLimit'),
      features: t('subscription.premium.features', { returnObjects: true }) as string[],
      current: currentPlan === 'premium' && (
        isYearly
          ? activeProductId === premiumYearly?.product.identifier
          : activeProductId === premiumMonthly?.product.identifier
      ),
    },
    {
      id: 'pro',
      name: t('subscription.pro.name'),
      price: isYearly
        ? (proYearly?.product.priceString || '')
        : (proMonthly?.product.priceString || ''),
      yearlyPrice: proYearly?.product.priceString || '',
      dailyLimit: t('subscription.pro.dailyLimit'),
      features: t('subscription.pro.features', { returnObjects: true }) as string[],
      current: currentPlan === 'pro' && (
        isYearly
          ? activeProductId === proYearly?.product.identifier
          : activeProductId === proMonthly?.product.identifier
      ),
    },
  ];

  const handleUpgrade = async (planId: string) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) return;

    if (planId === 'free') {
      toast({
        title: "Info",
        description: "You're on Free Trial",
      });
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      navigate(`/checkout?plan=${planId}&period=${isYearly ? 'yearly' : 'monthly'}`);
      return;
    }

    try {
      let success = false;
      const period = isYearly ? 'yearly' : 'monthly';

      console.log(`🚀 Upgrading to ${planId} with period: ${period}`);

      if (planId === 'premium') {
        success = await purchasePremium(period);
      } else if (planId === 'pro') {
        success = await purchasePro(period);
      }

      if (success) {
        if (planId === 'premium') upgradeToPremium(period);
        if (planId === 'pro') upgradeToPro(period);

        toast({
          title: t('common.success'),
          description: i18n.language === 'tr'
            ? `${plan.name} planına başarıyla yükseltildi!`
            : `Successfully upgraded to ${plan.name}!`,
        });
      }
    } catch (error: any) {
      toast({
        title: i18n.language === 'tr' ? 'Satın alma başarısız' : 'Purchase Failed',
        description: error.message || (i18n.language === 'tr' ? 'Bir hata oluştu' : 'Something went wrong'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      {/* Header */}
      <header className="bg-background border-b safe-top">
        <div className="container max-w-2xl px-4 py-4 mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/lists")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-2xl px-4 py-4 mx-auto space-y-4 pb-20">
        {/* Profile Section */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-primary shrink-0"
            />
            <div className="flex-1 min-w-0 overflow-hidden">
              <h2 className="text-lg font-semibold truncate">{userData.name}</h2>
              <p className="text-sm text-muted-foreground truncate">{userData.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/profile")}
              className="relative shrink-0 text-xs px-3 min-h-[44px]"
            >
              {t('settings.viewProfile')}
              {friendRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {friendRequests.length}
                </span>
              )}
            </Button>
          </div>
        </Card>

        {/* Usage Card - Modern Dashboard */}
        <UsageCard />



        {/* Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('settings.preferences')}</h3>

          {/* Language */}
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-base font-medium">
                    {t('settings.language')}
                  </Label>
                </div>
              </div>
              <Select value={i18n.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Theme */}
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label className="text-base font-medium">
                    {t('settings.theme')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {theme === "dark"
                      ? t('settings.darkMode')
                      : t('settings.lightMode')}
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-base font-medium">
                    {t('settings.notifications')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.notificationsDesc')}
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={handleNotificationToggle}
                disabled={notificationLoading}
              />
            </div>
          </Card>
        </div>

        {/* Subscription */}
        <div className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('subscription.title')}</h3>

            <Card className="p-4 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold capitalize">
                    {currentPlan === 'free' ? t('subscription.free.name') : currentPlan}
                  </h4>
                  <Badge variant={currentPlan === 'free' ? "secondary" : "default"}>
                    {t('subscription.currentPlan')}
                  </Badge>
                </div>

                {/* Inline Billing Toggle */}
                <div className="bg-background/50 p-1 rounded-lg border flex text-xs font-medium shrink-0">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-2 sm:px-3 py-1.5 rounded-md transition-all min-h-[36px] ${billingCycle === 'monthly'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-background/80'
                      }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-2 sm:px-3 py-1.5 rounded-md transition-all flex items-center gap-1 min-h-[36px] ${billingCycle === 'yearly'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-background/80'
                      }`}
                  >
                    Yearly
                    <span className="text-[10px] bg-green-500/20 text-green-700 dark:text-green-300 px-1 rounded">
                      -8.5%
                    </span>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">
                  {currentPlan === 'free' ? t('subscription.free.dailyLimit') : (
                    currentPlan === 'premium' ? t('subscription.premium.dailyLimit') : t('subscription.pro.dailyLimit')
                  )}
                </p>
              </div>

              <Button
                className="w-full min-h-[44px]"
                onClick={() => setSubscriptionPlansOpen(true)}
              >
                {t('subscription.manage')}
              </Button>
            </Card>
          </div>

          {/* App Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('settings.appSettings')}</h3>

            <Card className="divide-y">
              <div
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors min-h-[56px]"
                onClick={() => window.location.href = `mailto:smartmarketttt@gmail.com`}
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="text-base font-medium cursor-pointer">
                      {t('settings.contactUs')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.contactDescription')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rewarded Ad Slot */}
              <div className="p-4">
                <RewardedAdSlot
                  plan={currentPlan}
                  placement="settings_reward"
                  onReward={() => {
                    console.log('🎁 [Settings] onReward callback triggered');

                    try {
                      const result = rewardAdWatched();
                      console.log('🎁 [Settings] rewardAdWatched result:', result);

                      if (result && result.success) {
                        toast({
                          title: t('common.success'),
                          description: result.message,
                        });
                      } else {
                        toast({
                          title: i18n.language === 'tr' ? 'Bilgi' : 'Info',
                          description: result?.message || 'Reward processed',
                        });
                      }
                    } catch (error) {
                      console.error('❌ [Settings] Error processing reward:', error);
                      toast({
                        title: i18n.language === 'tr' ? 'Hata' : 'Error',
                        description: 'Failed to process reward',
                        variant: 'destructive',
                      });
                    }
                  }}
                />
              </div>



              <div
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-destructive/10 transition-colors min-h-[56px]"
                onClick={handleLogout}
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5 text-destructive" />
                  <Label className="text-base font-medium text-destructive cursor-pointer">
                    {t('settings.logout')}
                  </Label>
                </div>
              </div>
            </Card>


          </div>
        </div>
      </main>

      <BottomNav />

      {/* Subscription Plans Dialog */}
      <Dialog open={subscriptionPlansOpen} onOpenChange={setSubscriptionPlansOpen}>
        <DialogContent className="w-[calc(100vw-32px)] sm:max-w-2xl lg:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center mb-2">
              {t('subscription.title')}
            </DialogTitle>
            <DialogDescription className="text-center mb-6">
              Choose the plan that works best for you
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center mb-6">
            <div className="relative flex items-center bg-muted p-1.5 rounded-full border w-fit shadow-inner">
              {/* Active Pill Indicator */}
              <div
                className={`absolute inset-y-1.5 rounded-full bg-background shadow-md transition-all duration-300 ease-out`}
                style={{
                  left: isYearly ? 'calc(50% + 1px)' : '4px',
                  width: 'calc(50% - 5px)',
                }}
              />

              <button
                onClick={() => setBillingCycle('monthly')}
                className={`relative z-10 px-6 sm:px-8 py-2.5 text-sm font-bold transition-colors duration-200 rounded-full min-h-[44px] ${!isYearly ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`relative z-10 px-6 sm:px-8 py-2.5 text-sm font-bold transition-colors duration-200 rounded-full flex items-center gap-2 min-h-[44px] ${isYearly ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Yearly
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm animate-pulse-slow">
                  -8.5%
                </span>
              </button>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative p-4 flex flex-col ${plan.current
                  ? 'border-primary shadow-lg scale-105'
                  : 'border-border hover:border-primary/50'
                  }`}
              >
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      {t('subscription.currentPlan')}
                    </Badge>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-xl sm:text-2xl font-bold break-all">{plan.price}</span>
                    {plan.price !== 'Free' && plan.price !== 'Ücretsiz' && (
                      <span className="text-sm text-muted-foreground">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {isYearly && plan.yearlyPrice && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      {t('subscription.premium.yearlySavings')}
                    </p>
                  )}
                </div>

                <div className="flex-1 space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Badge variant="secondary" className="text-xs">{plan.dailyLimit}</Badge>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className="w-full min-h-[44px]"
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {plan.current ? t('subscription.currentPlan') : t('subscription.upgradeTo', { plan: plan.name })}
                </Button>
              </Card>
            ))}
          </div>
        </DialogContent >
      </Dialog >


    </div >
  );
};

export default Settings;