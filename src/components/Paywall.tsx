import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Shield, Loader2 } from "lucide-react";
import { usePurchases } from "@/hooks/usePurchases";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface PaywallProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    triggerFeature?: string;
}

export const Paywall = ({ open, onOpenChange, triggerFeature }: PaywallProps) => {
    const { t, i18n } = useTranslation();
    const { purchasePremium, purchasePro, restorePurchases, isLoading, offerings } = usePurchases();
    const { upgradeToPremium, upgradeToPro } = useSubscription();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isYearly, setIsYearly] = useState(true);

    // RevenueCat paketlerini bul
    const currentOffering = offerings?.current;
    const premiumMonthly = currentOffering?.availablePackages.find(p => p.identifier === 'premium_monthly');
    const premiumYearly = currentOffering?.availablePackages.find(p => p.identifier === 'premium_yearly');
    const proMonthly = currentOffering?.availablePackages.find(p => p.identifier === 'pro_monthly');
    const proYearly = currentOffering?.availablePackages.find(p => p.identifier === 'pro_yearly');

    const handlePurchase = async (plan: 'premium' | 'pro') => {
        const period = isYearly ? 'yearly' : 'monthly';

        if (!Capacitor.isNativePlatform()) {
            onOpenChange(false);
            navigate(`/checkout?plan=${plan}&period=${period}`);
            return;
        }

        try {
            let success = false;

            if (plan === 'premium') {
                success = await purchasePremium(period);
            } else {
                success = await purchasePro(period);
            }

            if (success) {
                if (plan === 'premium') upgradeToPremium();
                if (plan === 'pro') upgradeToPro();

                toast({
                    title: t('common.success'),
                    description: t('subscription.upgradeSuccess'),
                });
                onOpenChange(false);
            }
        } catch (error: any) {
            // Error is already handled in usePurchases but we can show a generic toast if needed
            // or rely on the hook's error state if we were displaying it inline
        }
    };

    const handleRestore = async () => {
        if (!Capacitor.isNativePlatform()) {
            toast({
                title: t('common.info'),
                description: "Restore is only available on mobile devices",
            });
            return;
        }

        const success = await restorePurchases();
        if (success) {
            toast({
                title: t('common.success'),
                description: t('subscription.restoreSuccess'),
            });
            // App.tsx'teki listener otomatik olarak state'i güncelleyecek
            onOpenChange(false);
        } else {
            toast({
                title: t('common.error'),
                description: t('subscription.restoreFailed'),
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Star className="w-8 h-8 text-primary fill-primary" />
                    </div>
                    <DialogTitle className="text-3xl font-bold">
                        {triggerFeature
                            ? t('subscription.unlockFeature', { feature: triggerFeature })
                            : t('subscription.upgradeTitle')}
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                        {t('subscription.upgradeDescription')}
                    </DialogDescription>
                </DialogHeader>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 py-6">
                    <Label htmlFor="billing-mode" className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {t('subscription.monthly')}
                    </Label>
                    <Switch
                        id="billing-mode"
                        checked={isYearly}
                        onCheckedChange={setIsYearly}
                    />
                    <Label htmlFor="billing-mode" className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {t('subscription.yearly')}
                        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                            {t('subscription.savePercent', { percent: 7 })}
                        </Badge>
                    </Label>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                    {/* Premium Plan */}
                    <div className="relative rounded-xl border-2 border-muted p-6 hover:border-primary/50 transition-all">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">{t('subscription.premium.name')}</h3>
                                <Zap className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">
                                    {isYearly
                                        ? (premiumYearly?.product.priceString || t('subscription.premium.yearlyPrice'))
                                        : (premiumMonthly?.product.priceString || t('subscription.premium.price'))}
                                </span>
                                <span className="text-muted-foreground">
                                    /{isYearly ? t('common.year') : t('common.month')}
                                </span>
                            </div>
                            <ul className="space-y-3 pt-4">
                                {(t('subscription.premium.features', { returnObjects: true }) as string[]).map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <Check className="w-4 h-4 text-green-500 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button
                                className="w-full mt-6"
                                variant="outline"
                                onClick={() => handlePurchase('premium')}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('subscription.choosePremium')}
                            </Button>
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="relative rounded-xl border-2 border-primary bg-primary/5 p-6 shadow-lg">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground px-3 py-1">
                                {t('subscription.mostPopular')}
                            </Badge>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">{t('subscription.pro.name')}</h3>
                                <Shield className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">
                                    {isYearly
                                        ? (proYearly?.product.priceString || t('subscription.pro.yearlyPrice'))
                                        : (proMonthly?.product.priceString || t('subscription.pro.price'))}
                                </span>
                                <span className="text-muted-foreground">
                                    /{isYearly ? t('common.year') : t('common.month')}
                                </span>
                            </div>
                            <ul className="space-y-3 pt-4">
                                {(t('subscription.pro.features', { returnObjects: true }) as string[]).map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <Check className="w-4 h-4 text-primary mt-0.5" />
                                        <span className="font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button
                                className="w-full mt-6"
                                onClick={() => handlePurchase('pro')}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('subscription.choosePro')}
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-4 items-center justify-center mt-6 text-sm text-muted-foreground">
                    <button onClick={handleRestore} className="hover:underline" disabled={isLoading}>
                        {t('subscription.restorePurchases')}
                    </button>
                    <span className="hidden sm:inline">•</span>
                    <button className="hover:underline">
                        {t('subscription.terms')}
                    </button>
                    <span className="hidden sm:inline">•</span>
                    <button className="hover:underline">
                        {t('subscription.privacy')}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
