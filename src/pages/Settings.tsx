import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
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
  CreditCard,
  Check,
  Gift,
  Loader2,
  Mail,
  MessageSquare,
  UserPlus,
  Copy,
  Share2,
  ChevronDown,
} from "lucide-react";
import { Share } from "@capacitor/share";
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
    referralCode,
    referralCount,
    regenerateReferralCode,
    hasUsedReferralButton,
    applyReferralCode,
    usedReferralCode,
    rewardAdWatched,
    subscriptionEndDate, // Added
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
  const [promoCode, setPromoCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [subscriptionPlansOpen, setSubscriptionPlansOpen] = useState(false);
  const [friendReferralCode, setFriendReferralCode] = useState("");
  const [isApplyingReferral, setIsApplyingReferral] = useState(false);
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
    if ((currentPlan === 'premium' || currentPlan === 'pro') && !isPremiumActive && !isProActive) {
      console.log("⚠️ Sync: Subscription Expired. Downgrading to Free.");
      downgradeToFree();
    }
  }, [customerInfo, currentPlan, upgradeToPremium, upgradeToPro, downgradeToFree, subscriptionEndDate]);

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

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir promosyon kodu girin",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    const result = await applyPromoCode(promoCode.trim());
    setIsApplying(false);

    if (result.success) {
      toast({
        title: "Başarılı! 🎉",
        description: result.message,
      });
      setPromoCode("");
    } else {
      toast({
        title: "Hata",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container max-w-4xl py-4">
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
      <main className="container max-w-4xl py-6 space-y-6">
        {/* Profile Section */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-primary"
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{userData.name}</h2>
              <p className="text-muted-foreground">{userData.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/profile")}
              className="relative"
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

        {/* Invite Friends Card */}
        <Card className="p-5 bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-orange-950/20 border-2 border-pink-200/50 dark:border-pink-800/50 hover:shadow-lg transition-all">
          <div
            className="flex items-center gap-4 w-full cursor-pointer"
            onClick={() => {
              if (currentPlan === 'free') {
                // regenerateReferralCode(); // KALDIRILDI - Sabit kod
                setReferralDialogOpen(true);
              } else {
                toast({
                  title: i18n.language === 'tr' ? 'Bilgi' : 'Info',
                  description: i18n.language === 'tr'
                    ? 'Bu özellik sadece free pakette kullanılabilir'
                    : 'This feature is only available for free plan',
                  variant: "default",
                });
              }
            }}
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center border-2 border-white dark:border-gray-900">
                <span className="text-xs font-bold text-gray-900">+7</span>
              </div>
            </div>

            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {i18n.language === 'tr' ? 'Arkadaş Davet Et' : 'Invite Friend'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentPlan === 'free'
                  ? (i18n.language === 'tr'
                    ? 'Arkadaşınız kodu kullandığında deneme süreniz +7 GÜN uzar!'
                    : 'Get +7 DAYS extension to your trial when your friend uses your code!')
                  : (i18n.language === 'tr'
                    ? 'Sadece free pakette kullanılabilir'
                    : 'Only available for free plan')}
              </p>
              {referralCount > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {i18n.language === 'tr'
                      ? `${referralCount} davet`
                      : `${referralCount} invited`}
                  </Badge>
                </div>
              )}
            </div>

            <div className="text-muted-foreground">
              <ArrowLeft className="h-5 w-5 rotate-180" />
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('settings.preferences')}</h3>

          {/* Language */}
          <Card className="p-4">
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
          <Card className="p-4">
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
          <Card className="p-4">
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

            {/* Main Subscription Card with Inline Toggle */}
            <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold capitalize">
                    {currentPlan === 'free' ? t('subscription.free.name') : currentPlan}
                  </h4>
                  <Badge variant={currentPlan === 'free' ? "secondary" : "default"}>
                    {t('subscription.currentPlan')}
                  </Badge>
                </div>

                {/* Inline Billing Toggle */}
                <div className="bg-background/50 p-1 rounded-lg border flex text-xs font-medium">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 py-1.5 rounded-md transition-all ${billingCycle === 'monthly'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-background/80'
                      }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${billingCycle === 'yearly'
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

              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {currentPlan === 'free' ? t('subscription.free.dailyLimit') : (
                    currentPlan === 'premium' ? t('subscription.premium.dailyLimit') : t('subscription.pro.dailyLimit')
                  )}
                </p>
              </div>

              <Button
                className="w-full"
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
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors"
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
                    const result = rewardAdWatched();
                    if (result.success) {
                      toast({
                        title: t('common.success'),
                        description: result.message,
                      });
                    } else {
                      toast({
                        title: "Bilgi",
                        description: result.message,
                      });
                    }
                  }}
                />
              </div>



              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-destructive/10 transition-colors"
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-2">
              {t('subscription.title')}
            </DialogTitle>
            <DialogDescription className="text-center mb-6">
              Choose the plan that works best for you
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center mb-8">
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
                className={`relative z-10 px-8 py-2.5 text-sm font-bold transition-colors duration-200 rounded-full ${!isYearly ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`relative z-10 px-8 py-2.5 text-sm font-bold transition-colors duration-200 rounded-full flex items-center gap-2 ${isYearly ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Yearly
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm animate-pulse-slow">
                  -8.5%
                </span>
              </button>
            </div>
          </div>


          <div className="grid md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative p-6 flex flex-col ${plan.current
                  ? 'border-primary shadow-lg scale-105'
                  : 'border-border hover:border-primary/50'
                  }`}
              >
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      {t('subscription.currentPlan')}
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.price !== 'Free' && plan.price !== 'Ücretsiz' && (
                      <span className="text-muted-foreground">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {isYearly && plan.yearlyPrice && (
                    <p className="text-sm text-green-600 mt-2 font-medium">
                      {t('subscription.premium.yearlySavings')}
                    </p>
                  )}
                </div>

                <div className="flex-1 space-y-4 mb-6">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Badge variant="secondary">{plan.dailyLimit}</Badge>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className="w-full"
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

      {/* Referral Dialog */}
      < Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('referral.title')}</DialogTitle>
            <DialogDescription>
              {t('referral.subtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>{t('referral.yourCode')}</Label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-center text-lg tracking-wider border-2 border-dashed border-primary/20">
                  {referralCode || "LOADING..."}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    if (referralCode) {
                      navigator.clipboard.writeText(referralCode);
                      toast({
                        title: t('referral.copied'),
                        description: t('referral.linkCopiedDesc'),
                      });
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={async () => {
                    if (referralCode) {
                      await Share.share({
                        title: 'Smart Market',
                        text: `Use my code ${referralCode} to get 2x daily limits!`,
                        url: 'https://smartmarket.app',
                      });
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                {t('referral.howItWorks')}
              </h4>
              <div className="grid gap-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <p className="text-sm">{t('referral.step1')}</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <p className="text-sm">{t('referral.step2')}</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <p className="text-sm">{t('referral.step3')}</p>
                </div>
              </div>
            </div>

            {!hasUsedReferralButton && !usedReferralCode && (
              <div className="pt-4 border-t">
                <Label>{t('referral.enterCode')}</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder={t('referral.enterCodePlaceholder')}
                    value={friendReferralCode}
                    onChange={(e) => setFriendReferralCode(e.target.value.toUpperCase())}
                  />
                  <Button
                    onClick={async () => {
                      if (!friendReferralCode.trim()) return;
                      setIsApplyingReferral(true);
                      const result = await applyReferralCode(friendReferralCode);
                      setIsApplyingReferral(false);

                      if (result.success) {
                        toast({
                          title: "Success! 🎉",
                          description: t('referral.success'),
                        });
                        setFriendReferralCode("");
                        setReferralDialogOpen(false);
                      } else {
                        toast({
                          title: "Error",
                          description: result.message || t('referral.invalid'),
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={isApplyingReferral || !friendReferralCode.trim()}
                  >
                    {isApplyingReferral ? <Loader2 className="h-4 w-4 animate-spin" /> : t('referral.apply')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog >
    </div >
  );
};

export default Settings;