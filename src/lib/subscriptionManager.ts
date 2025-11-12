export interface SubscriptionLimits {
  totalActions: number; // Toplam işlem sayısı (liste + scan + ai chef)
}

export interface SubscriptionUsage {
  totalActions: number; // Kullanılan toplam işlem
  lastResetDate: string;
}

export type SubscriptionPlan = 'free' | 'premium' | 'pro';

export const SUBSCRIPTION_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
  free: {
    totalActions: 7,
  },
  premium: {
    totalActions: 30,
  },
  pro: {
    totalActions: -1, // -1 = unlimited
  },
};

class SubscriptionManager {
  private getUsage(): SubscriptionUsage {
    const saved = localStorage.getItem('subscriptionUsage');
    if (saved) {
      const usage = JSON.parse(saved);
      // Check if month has changed - reset usage
      const lastReset = new Date(usage.lastResetDate);
      const now = new Date();
      
      if (
        lastReset.getMonth() !== now.getMonth() ||
        lastReset.getFullYear() !== now.getFullYear()
      ) {
        return this.resetUsage();
      }
      return usage;
    }
    return this.resetUsage();
  }

  private resetUsage(): SubscriptionUsage {
    const usage: SubscriptionUsage = {
      totalActions: 0,
      lastResetDate: new Date().toISOString(),
    };
    localStorage.setItem('subscriptionUsage', JSON.stringify(usage));
    return usage;
  }

  private saveUsage(usage: SubscriptionUsage) {
    localStorage.setItem('subscriptionUsage', JSON.stringify(usage));
  }

  getCurrentPlan(): SubscriptionPlan {
    const saved = localStorage.getItem('subscriptionPlan');
    return (saved as SubscriptionPlan) || 'free';
  }

  setPlan(plan: SubscriptionPlan) {
    localStorage.setItem('subscriptionPlan', plan);
  }

  canPerformAction(): boolean {
    const plan = this.getCurrentPlan();
    const limits = SUBSCRIPTION_LIMITS[plan];
    const usage = this.getUsage();

    // Unlimited (-1)
    if (limits.totalActions === -1) return true;

    // Check if under limit
    return usage.totalActions < limits.totalActions;
  }

  incrementAction() {
    const usage = this.getUsage();
    usage.totalActions++;
    this.saveUsage(usage);
  }

  getActionUsage(): { used: number; limit: number } {
    const plan = this.getCurrentPlan();
    const limits = SUBSCRIPTION_LIMITS[plan];
    const usage = this.getUsage();

    return {
      used: usage.totalActions,
      limit: limits.totalActions,
    };
  }

  getRemainingActions(): number {
    const plan = this.getCurrentPlan();
    const limits = SUBSCRIPTION_LIMITS[plan];
    const usage = this.getUsage();

    if (limits.totalActions === -1) return -1; // unlimited
    return Math.max(0, limits.totalActions - usage.totalActions);
  }
}

export const subscriptionManager = new SubscriptionManager();