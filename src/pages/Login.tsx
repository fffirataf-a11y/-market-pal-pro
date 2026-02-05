import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { ShoppingCart } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, loginWithEmail } = useFirebaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: i18n.language === 'tr' ? 'Hata' : 'Error',
        description: i18n.language === 'tr' ? 'Lütfen tüm alanları doldurun' : 'Please fill in all fields',
        variant: "destructive",
      });
      return;
    }

    try {
      await loginWithEmail(email, password);
      navigate("/lists");
    } catch (error: any) {
      // Error handling is done in useFirebaseAuth hook
      console.error('Login error:', error);
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
          <h1 className="text-3xl font-bold">{i18n.language === 'tr' ? 'Tekrar Hoş Geldin' : 'Welcome Back'}</h1>
          <p className="text-muted-foreground mt-2">{i18n.language === 'tr' ? 'Hesabına giriş yap' : 'Sign in to your account'}</p>
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? (i18n.language === 'tr' ? 'Giriş yapılıyor...' : 'Signing in...')
              : (i18n.language === 'tr' ? 'Giriş Yap' : 'Sign In')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {i18n.language === 'tr' ? 'Hesabın yok mu?' : "Don't have an account?"}{" "}
          <Link to="/signup" className="text-primary hover:underline">
            {i18n.language === 'tr' ? 'Kayıt ol' : 'Sign up'}
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;