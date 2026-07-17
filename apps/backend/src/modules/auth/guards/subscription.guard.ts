import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { isSubscriptionActive } from '../subscription.util';
import type { IRequestUser } from '../types/request-user';

/**
 * Enforces that the user's tenant has an active subscription on every request.
 * Public routes are skipped. For 100–150 tenants a per-request lookup is fine;
 * this can be cached (e.g. Redis) later if needed.
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: IRequestUser }>();
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('No tenant context');
    }

    const subscription = await this.prisma.subscription.findUnique({ where: { tenantId } });
    if (!isSubscriptionActive(subscription)) {
      throw new ForbiddenException({
        message: 'Your subscription is not active',
        error: 'SUBSCRIPTION_INACTIVE',
      });
    }
    return true;
  }
}
