import { Controller, Get } from '@nestjs/common';
import type { ISubscription } from '@agencyos/shared';
import { SubscriptionService } from './subscription.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  get(@CurrentUser('tenantId') tenantId: string): Promise<ISubscription | null> {
    return this.subscriptionService.getForTenant(tenantId);
  }
}
