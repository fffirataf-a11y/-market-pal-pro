import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Loader2, Mail, CheckCircle, AlertCircle, ArrowRight, WifiOff } from "lucide-react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from "@capacitor/core";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Auth = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const {
    loading,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    loginWithApple,
    continueAsGuest,
    resetPassword
  } = useFirebaseAuth();
  const { applyReferralCode } = useSubscription();
  const isOnline = useNetworkStatus();

  // Email/Password states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // Forgot password
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Email verification notice
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  // Email ile giriş
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!navigator.onLine) {
      toast({
        title: t('common.error'),
        description: i18n.language === 'tr' ? 'İnternet bağlantısı yok!' : 'No internet connection!',
        variant: "destructive",
      });
      return;
    }

    try {
      await loginWithEmail(email, password);
      // alert("Login function completed!"); // REMOVED
      navigate("/lists");
    } catch (error: any) {
      console.error('Login failed:', error);
      // alert(`LOGIN ERROR: ${error.message}`); // REMOVED
      // Login hook already shows toast on error, so we might duplicate it if we add another one here.
      // But adding a generic one is safe if the hook doesn't cover everything.
    }
  };

  // Email ile kayıt
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!navigator.onLine) {
      toast({
        title: t('common.error'),
        description: i18n.language === 'tr' ? 'İnternet bağlantısı yok. Lütfen ağınızı kontrol edin.' : 'No internet connection. Please check your network.',
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t('common.error'),
        description: i18n.language === 'tr' ? 'Şifreler eşleşmiyor' : "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t('common.error'),
        description: i18n.language === 'tr' ? 'Şifre en az 6 karakter olmalı' : 'Password must be at least 6 characters',
        variant: "destructive",
      });
      return;
    }

    try {
      await signupWithEmail(email, password, fullName);

      // Referral kodu varsa uygula
      if (referralCode.trim()) {
        const success = applyReferralCode(referralCode.trim().toUpperCase());
        if (success) {
          toast({
            title: t('common.success'),
            description: i18n.language === 'tr'
              ? 'Davet kodu uygulandı! 7 gün ücretsiz kazandınız!'
              : 'Referral code applied! You got 7 days free!',
          });
        } else {
          toast({
            title: t('common.error'),
            description: i18n.language === 'tr'
              ? 'Geçersiz davet kodu'
              : 'Invalid referral code',
            variant: "destructive",
          });
        }
      }

      // Başarılı kayıt sonrası verification notice göster
      setVerificationEmail(email);
      setShowVerificationNotice(true);

      // Form'u temizle
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
      setReferralCode("");
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  // Şifre sıfırlama
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(resetEmail);
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      {/* Email Verification Notice */}
      {showVerificationNotice ? (
        <Card className="w-full max-w-md p-8 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
                <Mail className="w-10 h-10 text-success" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6 text-success" />
                <h2 className="text-2xl font-bold">{t('auth.checkEmailTitle')}</h2>
              </div>
              <p className="text-muted-foreground">
                {t('auth.verificationSent')}
              </p>
              <p className="font-semibold text-primary">{verificationEmail}</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {t('auth.nextSteps')}
              </p>
              <ol className="text-sm text-muted-foreground text-left space-y-2 list-decimal list-inside">
                <li>{t('auth.step1')}</li>
                <li>{t('auth.step2')}</li>
                <li>{t('auth.step3')}</li>
              </ol>
            </div>

            {/* Spam Uyarısı */}
            <div className="bg-warning/10 border border-warning/30 p-4 rounded-lg">
              <p className="text-sm font-semibold text-warning-foreground mb-2 flex items-center justify-center gap-2">
                {t('auth.spamWarningTitle')}
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 text-left">
                <li className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span>{t('auth.spamWarning1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span>{t('auth.spamWarning2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span>{t('auth.spamWarning3')}</span>
                </li>
              </ul>
            </div>

            <Button
              className="w-full"
              onClick={() => {
                setShowVerificationNotice(false);
              }}
            >
              {t('auth.backToLogin')}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="w-full max-w-md p-8 shadow-2xl">
          {/* Offline Alert */}
          {!isOnline && (
            <Alert variant="destructive" className="mb-6 animate-in fade-in slide-in-from-top-2">
              <WifiOff className="h-4 w-4" />
              <AlertTitle>{i18n.language === 'tr' ? 'İnternet Yok' : 'No Internet Connection'}</AlertTitle>
              <AlertDescription>
                {i18n.language === 'tr'
                  ? 'Lütfen bağlantınızı kontrol edip tekrar deneyin.'
                  : 'Please check your connection and try again.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <img
              src="/logo.png"
              alt="SmartMarket Logo"
              className="w-16 h-16 rounded-2xl shadow-lg"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              SmartMarket
            </h1>
          </div>

          {/* Forgot Password Modal */}
          {showForgotPassword ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{i18n.language === 'tr' ? 'Şifreyi Sıfırla' : 'Reset Password'}</h2>
                <p className="text-sm text-muted-foreground">
                  {i18n.language === 'tr' ? 'Şifre sıfırlama linki almak için e-postanızı girin' : 'Enter your email to receive a password reset link'}
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {i18n.language === 'tr' ? 'Gönderiliyor...' : 'Sending...'}
                      </>
                    ) : (
                      i18n.language === 'tr' ? 'Sıfırlama Linki Gönder' : 'Send Reset Link'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    {i18n.language === 'tr' ? 'Girişe Dön' : 'Back to Login'}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Social Login Buttons */}
              <div className="space-y-3">
                {/* Google Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border-gray-300 font-medium"
                  onClick={async () => {
                    try {
                      await loginWithGoogle();
                      navigate("/lists");
                    } catch (error) {
                      console.error('Google login failed:', error);
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  {i18n.language === 'tr' ? 'Google ile Devam Et' : 'Continue with Google'}
                </Button>

                {/* Apple Button - Only show on iOS or web */}
                {(Capacitor.getPlatform() === 'ios' || !Capacitor.isNativePlatform()) && (
                  <Button
                    type="button"
                    className="w-full h-12 bg-black hover:bg-gray-900 text-white font-medium"
                    onClick={async () => {
                      try {
                        await loginWithApple();
                        navigate("/lists");
                      } catch (error) {
                        console.error('Apple login failed:', error);
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                    )}
                    {i18n.language === 'tr' ? 'Apple ile Devam Et' : 'Continue with Apple'}
                  </Button>
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {i18n.language === 'tr' ? 'veya email ile' : 'or with email'}
                  </span>
                </div>
              </div>

              {/* Email Login Tabs */}
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
                  <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
                </TabsList>

                {/* LOGIN TAB */}
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t('auth.email')}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t('auth.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t('auth.password')}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder={t('auth.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-xs"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      {t('auth.forgotPassword')}
                    </Button>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('common.loading')}
                        </>
                      ) : (
                        t('auth.login')
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* SIGNUP TAB */}
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">{t('auth.fullName')}</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder={t('auth.fullNamePlaceholder')}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t('auth.email')}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t('auth.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t('auth.password')}</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder={t('auth.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">{t('auth.confirmPassword')}</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder={t('auth.confirmPasswordPlaceholder')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    {/* REFERRAL CODE - ŞU ANLIK KAPALI (Build 85)
                  <div className="space-y-2">
                    <Label htmlFor="signup-referral">{t('referral.enterCode')}</Label>
                    <Input
                      id="signup-referral"
                      type="text"
                      placeholder={t('referral.enterCodePlaceholder')}
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      {i18n.language === 'tr'
                        ? 'Arkadaşınızın davet kodunu girerek 7 gün ücretsiz kazanın'
                        : 'Enter your friend\'s referral code to get 7 days free'}
                    </p>
                  </div>
                  */}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('common.loading')}
                        </>
                      ) : (
                        t('auth.signUp')
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Guest Mode Link */}
              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={async () => {
                    try {
                      await continueAsGuest();
                      navigate("/lists");
                    } catch (error) {
                      console.error('Guest login failed:', error);
                    }
                  }}
                  disabled={loading}
                >
                  {i18n.language === 'tr' ? 'Kayıt olmadan devam et' : 'Continue without signing up'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {i18n.language === 'tr'
                    ? 'Bazı özellikler için giriş gereklidir'
                    : 'Some features require login'}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Auth;