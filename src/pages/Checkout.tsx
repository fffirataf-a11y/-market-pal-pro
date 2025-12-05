import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { usePurchases } from "@/hooks/usePurchases";
import { Capacitor } from "@capacitor/core";

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { upgradeToPremium, upgradeToPro } = useSubscription();

  const planId = searchParams.get("plan") || "premium";
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const period = searchParams.get("period") || "monthly";
  const isYearly = period === "yearly";

  const plans = {
    premium: {
      name: t("subscription.premium.name"),
      price: isYearly ? t("subscription.premium.yearlyPrice") : t("subscription.premium.price"),
      features: t("subscription.premium.features", { returnObjects: true }) as string[],
    },
    pro: {
      name: t("subscription.pro.name"),
      price: isYearly ? t("subscription.pro.yearlyPrice") : t("subscription.pro.price"),
      features: t("subscription.pro.features", { returnObjects: true }) as string[],
    },
  };

  const selectedPlan = plans[planId as keyof typeof plans] || plans.premium;

  const { purchasePremium, purchasePro, isLoading: purchaseLoading } = usePurchases();

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvv || !name) {
      toast({
        title: t("common.error"),
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // NATIVE (iOS/Android) - Real Purchase
      if (Capacitor.isNativePlatform()) {
        let success = false;
        const periodParam = isYearly ? 'yearly' : 'monthly';

        if (planId === "premium") {
          success = await purchasePremium(periodParam);
        } else if (planId === "pro") {
          success = await purchasePro(periodParam);
        }

        if (success) {
          if (planId === "premium") upgradeToPremium();
          if (planId === "pro") upgradeToPro();

          toast({
            title: t("common.success"),
            description: `${selectedPlan.name} planına başarıyla yükseltildi!`,
          });
          navigate("/settings");
        }
      }
      // WEB - Mock Purchase
      else {
        setTimeout(() => {
          if (planId === "premium") upgradeToPremium();
          if (planId === "pro") upgradeToPro();

          toast({
            title: t("common.success"),
            description: `${selectedPlan.name} planına başarıyla yükseltildi! (Test Modu)`,
          });

          setLoading(false);
          navigate("/settings");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast({
        title: t("common.error"),
        description: error.message || "Satın alma işlemi başarısız oldu",
        variant: "destructive",
      });
    } finally {
      if (Capacitor.isNativePlatform()) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/settings")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.back")}
        </Button>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{selectedPlan.name}</CardTitle>
              <CardDescription>{selectedPlan.price}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ödeme Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Kart Üzerindeki İsim</Label>
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label>Kart Numarası</Label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ""))}
                  maxLength={16}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Son Kullanma</Label>
                  <Input
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={3}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "İşleniyor..." : `${selectedPlan.price} - Ödemeyi Tamamla`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

