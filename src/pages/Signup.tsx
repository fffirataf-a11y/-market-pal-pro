import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart } from "lucide-react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast({
        title: i18n.language === 'tr' ? 'Hata' : 'Error',
        description: i18n.language === 'tr' ? 'Lütfen tüm alanları doldurun' : 'Please fill in all fields',
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: i18n.language === 'tr' ? 'Hata' : 'Error',
        description: i18n.language === 'tr' ? 'Şifreler eşleşmiyor' : 'Passwords do not match',
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: i18n.language === 'tr' ? 'Hata' : 'Error',
        description: i18n.language === 'tr' ? 'Şifre en az 6 karakter olmalı' : 'Password must be at least 6 characters',
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await signup(email, password);
      toast({
        title: t('common.success'),
        description: i18n.language === 'tr' ? 'Hesap başarıyla oluşturuldu' : 'Account created successfully',
      });
      navigate("/lists");
    } catch (error: any) {
      toast({
        title: i18n.language === 'tr' ? 'Kayıt başarısız' : 'Signup Failed',
        description: error.message || (i18n.language === 'tr' ? 'Hesap oluşturulamadı' : 'Could not create account'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="SmartMarket"
            className="w-20 h-20 rounded-2xl shadow-lg mb-4"
          />
          <h1 className="text-3xl font-bold">{i18n.language === 'tr' ? 'Hesap Oluştur' : 'Create Account'}</h1>
          <p className="text-muted-foreground mt-2">{i18n.language === 'tr' ? 'SmartMarket\'e bugün katıl' : 'Join SmartMarket today'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{i18n.language === 'tr' ? 'E-posta' : 'Email'}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{i18n.language === 'tr' ? 'Şifre' : 'Password'}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{i18n.language === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? (i18n.language === 'tr' ? 'Hesap oluşturuluyor...' : 'Creating account...')
              : (i18n.language === 'tr' ? 'Kayıt Ol' : 'Sign Up')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {i18n.language === 'tr' ? 'Zaten hesabın var mı?' : 'Already have an account?'}{" "}
          <Link to="/login" className="text-primary hover:underline">
            {i18n.language === 'tr' ? 'Giriş yap' : 'Sign in'}
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Signup;