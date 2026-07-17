import { SubscriptionStatus } from '@agencyos/shared';

interface ISubscriptionLike {
  status: string;
  currentPeriodEnd: Date;
}

/** A subscription grants access when it is TRIALING/ACTIVE and not past its period end. */
export function isSubscriptionActive(subscription: ISubscriptionLike | null): boolean {
  if (!subscription) {
    return false;
  }
  const withinPeriod = subscription.currentPeriodEnd.getTime() > Date.now();
  const grantingStatus =
    subscription.status === SubscriptionStatus.ACTIVE ||
    subscription.status === SubscriptionStatus.TRIALING;
  return grantingStatus && withinPeriod;
}
