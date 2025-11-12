import { Progress } from "@/components/ui/progress";

interface UsageBarProps {
  label: string;
  used: number;
  limit: number;
  icon: React.ReactNode;
}

export const UsageBar = ({ label, used, limit, icon }: UsageBarProps) => {
  const percentage = limit === -1 ? 100 : (used / limit) * 100;
  const remaining = limit === -1 ? '∞' : limit - used;
  const isNearLimit = percentage > 70 && limit !== -1;
  const isAtLimit = used >= limit && limit !== -1;

  // Daha güzel renkler
  const getProgressColor = () => {
    if (isAtLimit) return "bg-red-500";
    if (isNearLimit) return "bg-orange-500";
    return "bg-gradient-to-r from-blue-500 to-purple-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <span className={`font-semibold ${isAtLimit ? 'text-red-600 dark:text-red-400' : isNearLimit ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>
          {used} / {limit === -1 ? '∞' : limit}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all duration-500 ease-out ${getProgressColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {limit === -1 ? 'Unlimited' : `${remaining} remaining this month`}
      </p>
    </div>
  );
};