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
  Trash2,
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
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { usePurchases } from "@/hooks/usePurchases";
import { Capacitor } from "@capacitor/core";
import { UsageCard } from "@/components/UsageCard";

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
  } = useSubscription();
  const { 
    purchasePremium, 
    purchasePro, 
    isLoading: purchaseLoading,
    error: purchaseError 
  } = usePurchases();
  const { permission, loading: notificationLoading, requestPermission } = useNotifications(); // ✅ EKLE
  const [notifications, setNotifications] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [subscriptionPlansOpen, setSubscriptionPlansOpen] = useState(false);
  const [friendReferralCode, setFriendReferralCode] = useState("");
  const [isApplyingReferral, setIsApplyingReferral] = useState(false);
  // User data state
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.avatar || parsed.avatar === "") {
        parsed.avatar = "https://api.dicebear.com/9.x/thumbs/svg?seed=Easton"
      }
      return parsed;
    }
    
    return {
      name: "Guest User",
      email: "guest@smartmarket.app",
      avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=SmartMarket&backgroundColor=b6e3f4,c0aede,ffd5dc"
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

  const handleClearCache = () => {
    const shoppingItems = localStorage.getItem('shoppingItems');
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    const language = localStorage.getItem('language');
    const userToken = localStorage.getItem('userToken');
    const user = localStorage.getItem('user');
    const themeValue = localStorage.getItem('theme');
    const friends = localStorage.getItem('friends');
    const subscription_state = localStorage.getItem('subscription_state');
    
    localStorage.clear();
    
    if (shoppingItems) localStorage.setItem('shoppingItems', shoppingItems);
    if (onboardingCompleted) localStorage.setItem('onboardingCompleted', onboardingCompleted);
    if (language) localStorage.setItem('language', language);
    if (userToken) localStorage.setItem('userToken', userToken);
    if (user) localStorage.setItem('user', user);
    if (themeValue) localStorage.setItem('theme', themeValue);
    if (friends) localStorage.setItem('friends', friends);
    if (subscription_state) localStorage.setItem('subscription_state', subscription_state);
    
    toast({
      title: t('common.success'),
      description: "Cache cleared successfully",
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
      price: t('subscription.premium.price'),
      yearlyPrice: t('subscription.premium.yearlyPrice'),
      dailyLimit: t('subscription.premium.dailyLimit'),
      features: t('subscription.premium.features', { returnObjects: true }) as string[],
      current: currentPlan === 'premium',
    },
    {
      id: 'pro',
      name: t('subscription.pro.name'),
      price: t('subscription.pro.price'),
      yearlyPrice: t('subscription.pro.yearlyPrice'),
      dailyLimit: t('subscription.pro.dailyLimit'),
      features: t('subscription.pro.features', { returnObjects: true }) as string[],
      current: currentPlan === 'pro',
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

    // Sadece mobil platformda IAP kullan (RevenueCat)
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: i18n.language === 'tr' ? 'Bilgi' : 'Info',
        description: i18n.language === 'tr' 
          ? 'Abonelik sadece mobil uygulamada kullanılabilir' 
          : 'Subscriptions are only available in the mobile app',
        variant: "default",
      });
      return;
    }

    try {
      let success = false;
      
      if (planId === 'premium') {
        success = await purchasePremium();
      } else if (planId === 'pro') {
        success = await purchasePro();
      }

      if (success) {
        if (planId === 'premium') upgradeToPremium();
        if (planId === 'pro') upgradeToPro();
        
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

// ✅ YENİ FONKSIYON EKLE ⬇️
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
              {/* ✅ YENİ: Badge */}
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

        {/* Invite Friends Card - Her zaman aktif, her basıda yeni kod üretir */}
        <Card className="p-5 bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-orange-950/20 border-2 border-pink-200/50 dark:border-pink-800/50 hover:shadow-lg transition-all">
          <div 
            className="flex items-center gap-4 w-full cursor-pointer"
            onClick={() => {
              console.log('Button clicked, currentPlan:', currentPlan);
              if (currentPlan === 'free') {
                // Her basıda yeni kod üret
                regenerateReferralCode();
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
            {/* Gift Icon */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center border-2 border-white dark:border-gray-900">
                <span className="text-xs font-bold text-gray-900">+7</span>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {i18n.language === 'tr' ? 'Arkadaş Davet Et' : 'Invite Friend'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentPlan === 'free' 
                  ? (i18n.language === 'tr' 
                      ? 'Arkadaşınız kodu kullandığında free paketinize +7 gün eklenir!' 
                      : 'Get +7 days to your free plan when your friend uses your code!')
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
            
            {/* Arrow */}
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
          {permission === 'granted' ? '✅ Enabled' : 
           permission === 'denied' ? '❌ Blocked - Enable in browser settings' : 
           '⚠️ Not enabled'}
        </p>
      </div>
    </div>
    <Switch
      checked={notifications && permission === 'granted'}
      onCheckedChange={handleNotificationToggle}
      disabled={notificationLoading || permission === 'denied'}
    />
  </div>
</Card>

          

          {/* Contact Us */}
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <Label className="text-base font-medium">
                    {t('settings.contactUs')}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('settings.contactDescription')}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const subject = encodeURIComponent(
                    i18n.language === 'tr' 
                      ? 'Öneri/Şikayet - SmartMarket' 
                      : 'Suggestion/Complaint - SmartMarket'
                  );
                  const body = encodeURIComponent(
                    i18n.language === 'tr'
                      ? 'Merhaba,\n\n'
                      : 'Hello,\n\n'
                  );
                  window.location.href = `mailto:smartmarketttt@gmail.com?subject=${subject}&body=${body}`;
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                {t('settings.sendEmail')}
              </Button>
            </div>
          </Card>

        </div>
        {/* Subscription Plans - Collapsible */}
        <Collapsible open={subscriptionPlansOpen} onOpenChange={setSubscriptionPlansOpen}>
          <CollapsibleTrigger asChild>
            <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">{t('subscription.title')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {i18n.language === 'tr' 
                        ? 'Abonelik planlarını görüntüle ve yönet' 
                        : 'View and manage subscription plans'}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${subscriptionPlansOpen ? 'rotate-180' : ''}`} />
              </div>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-4 mt-4">
              <div className="grid gap-4">
                {subscriptionPlans.map((plan) => (
                  <Card key={plan.id} className={`p-6 ${plan.current ? 'ring-2 ring-primary' : ''}`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xl font-bold">{plan.name}</h4>
                            {plan.current && (
                              <Badge className="bg-primary text-primary-foreground">
                                {t('subscription.currentPlan')}
                              </Badge>
                            )}
                            {plan.id === 'free' && plan.isTrialActive && (
                              <Badge variant="secondary">
                                {t('subscription.trialDaysLeft', { days: plan.trialDays })}
                              </Badge>
                            )}
                            {plan.id === 'free' && !plan.isTrialActive && (
                              <Badge variant="destructive">
                                {t('subscription.trialExpired')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-2xl font-bold text-primary">{plan.price}</p>
                          {(plan.id === 'premium' || plan.id === 'pro') && (
                            <p className="text-sm text-muted-foreground">
                              {plan.yearlyPrice} · {t(`subscription.${plan.id}.yearlySavings`)}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">{plan.dailyLimit}</Badge>
                          </div>
                        </div>
                        {!plan.current && (
                          <Button onClick={() => handleUpgrade(plan.id)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            {plan.id === 'free' ? 'Current' : t('subscription.upgrade')}
                          </Button>
                        )}
                      </div>
                      <ul className="space-y-2">
                        {(Array.isArray(plan.features) ? plan.features : []).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Promosyon Kodu - Abonelik planları içinde */}
              {!promoCodeUsed && (
                <Card className="p-6 mt-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Gift className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {i18n.language === 'tr' ? 'Promosyon Kodu' : 'Promo Code'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {i18n.language === 'tr' 
                            ? 'Özel bir kodunuz varsa Premium veya Pro plana ücretsiz erişin' 
                            : 'Enter a special code to get free access to Premium or Pro plan'}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder={i18n.language === 'tr' 
                            ? 'Kodu buraya girin (örn: SmartMarket_Lionx)' 
                            : 'Enter code here (e.g., SmartMarket_Lionx)'}
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          disabled={isApplying}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleApplyPromoCode}
                          disabled={isApplying || !promoCode.trim()}
                        >
                          {isApplying ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {i18n.language === 'tr' ? 'Kontrol Ediliyor...' : 'Checking...'}
                            </>
                          ) : (
                            i18n.language === 'tr' ? 'Uygula' : 'Apply'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* App Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('settings.appSettings')}</h3>

          

          <Card className="p-4">
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('settings.logout')}
            </Button>
          </Card>
        </div>
      </main>

      <BottomNav />

      {/* Referral Code Dialog - Hem kod üretme hem kod girişi */}
      <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-pink-500" />
              {i18n.language === 'tr' ? 'Arkadaş Davet Et' : 'Invite Friend'}
            </DialogTitle>
            <DialogDescription>
              {i18n.language === 'tr' 
                ? 'Kodunuzu paylaşın veya arkadaşınızın kodunu girin' 
                : 'Share your code or enter your friend\'s code'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Kendi Kodunuzu Paylaş */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {i18n.language === 'tr' ? 'Kendi Kodunuz' : 'Your Code'}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={referralCode}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                    toast({
                      title: t('referral.copied'),
                      description: i18n.language === 'tr' 
                        ? 'Kod kopyalandı!' 
                        : 'Code copied!',
                    });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: i18n.language === 'tr' 
                          ? 'SmartMarket Davet Kodu' 
                          : 'SmartMarket Referral Code',
                        text: i18n.language === 'tr'
                          ? `SmartMarket'i denemek için davet kodumu kullan: ${referralCode}`
                          : `Use my referral code to try SmartMarket: ${referralCode}`,
                      });
                    } else {
                      navigator.clipboard.writeText(referralCode);
                      toast({
                        title: t('referral.copied'),
                        description: i18n.language === 'tr' 
                          ? 'Kod kopyalandı!' 
                          : 'Code copied!',
                      });
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {referralCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-success" />
                  <span>
                    {i18n.language === 'tr'
                      ? `${referralCount} arkadaş davet ettiniz`
                      : `You've invited ${referralCount} friend${referralCount > 1 ? 's' : ''}`}
                  </span>
                </div>
              )}
            </div>

            {/* Arkadaş Kodunu Gir */}
            {currentPlan === 'free' && !usedReferralCode && (
              <>
                <div className="border-t pt-4 space-y-3">
                  <Label className="text-sm font-medium">
                    {i18n.language === 'tr' ? 'Arkadaş Kodunu Gir' : 'Enter Friend\'s Code'}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={i18n.language === 'tr' 
                        ? 'Davet kodunu girin (örn: SMART-XXXXXXXXXXXX)' 
                        : 'Enter referral code (e.g., SMART-XXXXXXXXXXXX)'}
                      value={friendReferralCode}
                      onChange={(e) => setFriendReferralCode(e.target.value.toUpperCase())}
                      disabled={isApplyingReferral}
                      className="flex-1 font-mono text-sm"
                    />
                    <Button 
                      onClick={async () => {
                        if (!friendReferralCode.trim()) {
                          toast({
                            title: i18n.language === 'tr' ? 'Hata' : 'Error',
                            description: i18n.language === 'tr' 
                              ? 'Lütfen bir kod girin' 
                              : 'Please enter a code',
                            variant: "destructive",
                          });
                          return;
                        }
                        setIsApplyingReferral(true);
                        const success = applyReferralCode(friendReferralCode.trim());
                        setIsApplyingReferral(false);
                        
                        if (success) {
                          toast({
                            title: i18n.language === 'tr' ? 'Başarılı! 🎉' : 'Success! 🎉',
                            description: i18n.language === 'tr' 
                              ? 'Davet kodu uygulandı! Free paketinize +7 gün eklendi.' 
                              : 'Referral code applied! +7 days added to your free plan.',
                          });
                          setFriendReferralCode("");
                          setReferralDialogOpen(false);
                        } else {
                          toast({
                            title: i18n.language === 'tr' ? 'Hata' : 'Error',
                            description: i18n.language === 'tr' 
                              ? 'Geçersiz veya kullanılmış kod' 
                              : 'Invalid or already used code',
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={isApplyingReferral || !friendReferralCode.trim()}
                    >
                      {isApplyingReferral ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {i18n.language === 'tr' ? 'Uygulanıyor...' : 'Applying...'}
                        </>
                      ) : (
                        i18n.language === 'tr' ? 'Uygula' : 'Apply'
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Bilgilendirme */}
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">+7</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {i18n.language === 'tr'
                    ? 'Arkadaşınız kodunuzu kullandığında, free paketinize +7 gün eklenir'
                    : 'When your friend uses your code, you get +7 days to your free plan'}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Gift className="h-4 w-4 text-pink-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {i18n.language === 'tr'
                    ? 'Arkadaşınız da +7 gün ücretsiz kazanır'
                    : 'Your friend also gets +7 days free'}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    
    </div>
  );
};

export default Settings;