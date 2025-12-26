import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Calendar, TrendingUp, Clock, Zap
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "react-i18next";

export const UsageCard = () => {
  const { t } = useTranslation();
  const {
    plan,
    dailyLimit,
    dailyUsed,
    isTrialActive,
    getTrialDaysRemaining,
    getUsagePercentage,
    getRemainingActions,
  } = useSubscription();

  const usagePercent = Math.round(getUsagePercentage());
  const trialDaysLeft = getTrialDaysRemaining();
  const remainingActions = getRemainingActions();
  const dailyRemaining = plan === 'pro' ? '∞' : remainingActions;

  return (
    <div className="space-y-4">
      {/* Main Usage Card */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-3xl blur-3xl" />

        {/* Main Card */}
        <Card className="relative backdrop-blur-xl bg-white/70 dark:bg-black/70 border-white/20 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Badge className="mb-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
                    {plan === 'pro' ? t('subscription.pro.name') :
                      plan === 'premium' ? t('subscription.premium.name') :
                        t('subscription.free.name')}
                  </Badge>
                  <h3 className="font-bold text-lg">
                    {plan === 'free' && isTrialActive
                      ? t('subscription.trialDaysLeft', { days: trialDaysLeft })
                      : plan === 'free'
                        ? t('subscription.trialExpired')
                        : t('subscription.monthlyUsage')}
                  </h3>
                </div>
              </div>
              <div className="text-right">
                {plan === 'pro' ? (
                  <div>
                    <Zap className="w-8 h-8 text-yellow-500 mx-auto" />
                    <p className="text-xs text-muted-foreground mt-1">{t('subscription.unlimitedActions')}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                      {usagePercent}%
                    </p>
                    <p className="text-xs text-muted-foreground">{t('subscription.used')}</p>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar - Only for non-Pro */}
            {plan !== 'pro' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {dailyUsed} / {dailyLimit === -1 ? '∞' : dailyLimit} {t('subscription.totalActions')}
                  </span>
                  <span className="text-muted-foreground">
                    {remainingActions} {t('subscription.remaining')}
                  </span>
                </div>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${usagePercent}%` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/50">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                <p className="text-xl font-bold">{dailyUsed}</p>
                <p className="text-xs text-muted-foreground">{t('subscription.today')}</p>
              </div>

              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border border-green-200/50 dark:border-green-800/50">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-600 dark:text-green-400" />
                <p className="text-xl font-bold">{dailyRemaining}</p>
                <p className="text-xs text-muted-foreground">{t('subscription.dailyLeft')}</p>
              </div>

              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200/50 dark:border-purple-800/50">
                <Clock className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                <p className="text-xl font-bold">
                  {isTrialActive ? trialDaysLeft : '∞'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isTrialActive ? t('subscription.daysLeft') : t('subscription.unlimited')}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};