import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PlayCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PlanType } from "@/types/subscription";
import { useToast } from "@/hooks/use-toast";
import {
  isAdSupportedForPlan,
  showRewardedAd,
  getRewardedAdStatus,
  preloadRewardedAd
} from "@/lib/adManager";
import { useEffect } from "react";

type RewardedStatus = "idle" | "loading" | "completed";

interface RewardedAdSlotProps {
  plan: PlanType;
  placement?: string;
  onReward?: () => void;
  disabled?: boolean;
}

const RewardedAdSlot = ({
  plan,
  placement = "default",
  onReward,
  disabled,
}: RewardedAdSlotProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  // Start with loading state if on mobile, idle if on web
  const [status, setStatus] = useState<RewardedStatus>("loading");
  const [lastSimulated, setLastSimulated] = useState<Date | null>(null);

  useEffect(() => {
    // 1. Check initial status
    const isLoaded = getRewardedAdStatus();
    if (isLoaded) {
      setStatus("idle");
    } else {
      // Trigger generic preload if not ready (just in case)
      preloadRewardedAd();
    }

    // 2. Listen for "Loaded" event
    const handleAdLoaded = () => {
      console.log("🔔 UI: Ad Loaded Event Received!");
      setStatus("idle");
    };

    window.addEventListener('rewardedAdLoaded', handleAdLoaded);
    return () => window.removeEventListener('rewardedAdLoaded', handleAdLoaded);
  }, []);

  if (!isAdSupportedForPlan(plan)) {
    return null;
  }

  const handleWatchAd = async () => {
    console.log('[RewardedAd] 🎬 Button clicked');
    console.log('[RewardedAd] 📊 Current status:', status);
    console.log('[RewardedAd] 🚫 Disabled:', disabled);

    if (status === "loading" || disabled) {
      console.log('[RewardedAd] ⛔ Blocked - status:', status, 'disabled:', disabled);
      return;
    }

    try {
      console.log('[RewardedAd] ▶️ Starting ad request...');
      setStatus("loading");
      await showRewardedAd(plan, {
        placement,
        onComplete: () => {
          console.log('[RewardedAd] ✅ Ad completed, granting reward');
          setStatus("completed");
          setLastSimulated(new Date());
          onReward?.();
        },
      });
    } catch (error: any) {
      console.error("[RewardedAd] ❌ Ad error:", error);
      console.error("[RewardedAd] ❌ Error message:", error.message);
      setStatus("idle");

      // Show error toast to user (bilingual)
      const errorMessage = error.message || 'Failed to load ad';
      const isTurkish = localStorage.getItem('i18nextLng')?.startsWith('tr');
      toast({
        title: isTurkish ? "Reklam Yüklenemedi" : "Ad Unavailable",
        description: errorMessage.includes('timeout')
          ? (isTurkish ? "Reklam yüklenirken zaman aşımı. Lütfen daha sonra tekrar deneyin." : "Ad loading timed out. Please try again later.")
          : (isTurkish ? "Reklam yüklenemedi. Bağlantınızı kontrol edin." : "Unable to load ad. Please check your connection."),
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-4 border-dashed border-primary/40 bg-primary/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary" />
            {t("ads.rewardedTitle")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t("ads.rewardedDescription")}
          </p>
          {lastSimulated && (
            <p className="text-xs text-muted-foreground mt-2">
              {t("ads.lastPlayed", {
                time: lastSimulated.toLocaleTimeString(),
              })}
            </p>
          )}
        </div>
        <Button
          onClick={handleWatchAd}
          disabled={status === "loading" || disabled}
          className="self-start min-w-[180px]"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("ads.loading")}
            </>
          ) : (
            t("ads.watch")
          )}
        </Button>
      </div>
      {status === "completed" && (
        <p className="text-xs text-emerald-600 mt-3 font-medium">
          {t("ads.completed")}
        </p>
      )}
    </Card>
  );
};

export default RewardedAdSlot;

