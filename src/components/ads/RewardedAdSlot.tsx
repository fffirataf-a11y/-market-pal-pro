import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PlayCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PlanType } from "@/types/subscription";
import {
  isAdSupportedForPlan,
  showRewardedAd,
} from "@/lib/adManager";

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
  const [status, setStatus] = useState<RewardedStatus>("idle");
  const [lastSimulated, setLastSimulated] = useState<Date | null>(null);

  if (!isAdSupportedForPlan(plan)) {
    return null;
  }

  const handleWatchAd = async () => {
    if (status === "loading" || disabled) return;

    try {
      setStatus("loading");
      await showRewardedAd(plan, {
        placement,
        onComplete: () => {
          setStatus("completed");
          setLastSimulated(new Date());
          onReward?.();
        },
      });
    } catch (error) {
      console.error("Rewarded ad placeholder error:", error);
      setStatus("idle");
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

