import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const {
    loading,
    loginWithEmail,
    signupWithEmail,
    resetPassword
  } = useFirebaseAuth();
  const { applyReferralCode } = useSubscription();

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
        description: "No internet connection. Please check your network.",
        variant: "destructive",
      });
      return;
    }

    try {
      await loginWithEmail(email, password);
      navigate("/lists");
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Email ile kayıt
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!navigator.onLine) {
      toast({
        title: t('common.error'),
        description: "No internet connection. Please check your network.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
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
                <h2 className="text-2xl font-bold">Check Your Email</h2>
              </div>
              <p className="text-muted-foreground">
                We've sent a verification link to:
              </p>
              <p className="font-semibold text-primary">{verificationEmail}</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-foreground">
                📬 Next steps:
              </p>
              <ol className="text-sm text-muted-foreground text-left space-y-2 list-decimal list-inside">
                <li>Open your email inbox</li>
                <li>Click the verification link</li>
                <li>Come back and log in</li>
              </ol>
            </div>

            {/* Spam Uyarısı */}
            <div className="bg-warning/10 border border-warning/30 p-4 rounded-lg">
              <p className="text-sm font-semibold text-warning-foreground mb-2 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                ⚠️ Can't find the email?
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 text-left">
                <li className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span><strong>Check your SPAM/JUNK folder</strong> - verification emails often end up there</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span>Wait a few minutes - emails can take time to arrive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span>Check if you entered the correct email address</span>
                </li>
              </ul>
            </div>

            <Button
              className="w-full"
              onClick={() => {
                setShowVerificationNotice(false);
              }}
            >
              Back to Login
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="w-full max-w-md p-8 shadow-2xl">
          {/* Logo */}
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
                <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email to receive a password reset link
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
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
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
          )}
        </Card>
      )}
    </div>
  );
};

export default Auth;