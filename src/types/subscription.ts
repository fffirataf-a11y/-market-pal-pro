export type PlanType = 'free' | 'premium' | 'pro';

export interface SubscriptionPlan {
    id: PlanType;
    name: string;
    price: number;
    currency: string;
    features: string[];
    limit: number;
}
