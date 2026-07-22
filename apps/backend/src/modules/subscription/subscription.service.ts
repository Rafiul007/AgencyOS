import { Injectable } from '@nestjs/common';
import type { Subscription } from '@prisma/client';
import type { ISubscription, SubscriptionStatus } from '@agencyos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { isSubscriptionActive } from '../auth/subscription.util';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  /** The tenant's subscription, or null if none exists (treated as "no plan"). */
  async getForTenant(tenantId: string): Promise<ISubscription | null> {
    const subscription = await this.prisma.subscription.findUnique({ where: { tenantId } });
    return subscription ? this.toDto(subscription) : null;
  }

  private toDto(sub: Subscription): ISubscription {
    const daysRemaining = Math.max(
      0,
      Math.ceil((sub.currentPeriodEnd.getTime() - Date.now()) / DAY_MS),
    );
    return {
      status: sub.status as SubscriptionStatus,
      plan: sub.plan,
      maxSubUsers: sub.maxSubUsers,
      currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
      daysRemaining,
      isActive: isSubscriptionActive(sub),
    };
  }
}
