import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Sparkles, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Paywall } from "@/components/Paywall";
import { useTranslation } from "react-i18next";

interface LimitReachedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  currentPlan: string;
  rewardAdWatched?: () => { success: boolean; message: string; };
}

export const LimitReachedDialog = ({
  open,
  onOpenChange,
  feature,
  currentPlan,
  rewardAdWatched,
}: LimitReachedDialogProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleUpgrade = () => {
    onOpenChange(false);
    setShowPaywall(true);
  };

  const handleWatchAd = () => {
    if (rewardAdWatched) {
      const result = rewardAdWatched();
      if (result.success) {
        onOpenChange(false);
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <DialogTitle className="text-center">{t('common.limitReached') || "Limit Reached"}</DialogTitle>
            <DialogDescription className="text-center">
              {t('common.limitReachedDesc', { feature }) || `You have reached the limit for ${feature}.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button onClick={handleUpgrade} className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              {t('subscription.viewPlans') || "View Plans"}
            </Button>

            {rewardAdWatched && currentPlan === 'free' && (
              <Button variant="outline" onClick={handleWatchAd} className="w-full">
                <PlayCircle className="mr-2 h-4 w-4" />
                {t('common.watchAd') || "Watch Ad (+3 Actions)"}
              </Button>
            )}

            <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
              {t('common.cancel') || "Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Paywall
        open={showPaywall}
        onOpenChange={setShowPaywall}
        triggerFeature={feature}
      />
    </>
  );
};