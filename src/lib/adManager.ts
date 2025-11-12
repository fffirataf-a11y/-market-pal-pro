import type { PlanType } from "@/hooks/useSubscription";
import { ADS_ENABLED, ADS_AUTOPLAY_ON_START, ADS_SESSION_PLAY_KEY } from "@/config/featureFlags";

export type RewardedAdOptions = {
  placement?: string;
  onComplete?: () => void;
};

const AD_ELIGIBLE_PLANS: PlanType[] = ["free"];

export const isAdSupportedForPlan = (plan: PlanType): boolean => {
  return AD_ELIGIBLE_PLANS.includes(plan);
};

export const showRewardedAdPlaceholder = async (
  options: RewardedAdOptions = {}
): Promise<void> => {
  const placement = options.placement ?? "generic";
  console.log(`[Ads] Placeholder rewarded ad requested for: ${placement}`);

  // TODO: Integrate real rewarded ad SDK here (e.g., AdMob, AppLovin, Unity)
  // Simulate ad loading + playback for now
  await new Promise((resolve) => setTimeout(resolve, 1200));

  console.log("[Ads] Placeholder rewarded ad finished");
  options.onComplete?.();
};

/**
 * If feature flags allow and this session hasn't auto-played yet,
 * auto-play a rewarded ad for eligible plans on app start.
 */
export const maybeAutoplayOnStart = async (
  plan: PlanType,
  placement = "autoplay_start",
  onComplete?: () => void
) => {
  if (!ADS_ENABLED || !ADS_AUTOPLAY_ON_START) return;
  if (!isAdSupportedForPlan(plan)) return;

  // Only once per session
  const played = sessionStorage.getItem(ADS_SESSION_PLAY_KEY);
  if (played === "1") return;

  await showRewardedAdPlaceholder({ placement, onComplete });
  sessionStorage.setItem(ADS_SESSION_PLAY_KEY, "1");
};

