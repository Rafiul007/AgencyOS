import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OnboardingTaskStatus } from '@agencyos/shared';
import type { IOnboardingState, ITenantSettings, QuoteTemplate } from '@agencyos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async getState(tenantId: string): Promise<IOnboardingState> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { onboardingTasks: { orderBy: { order: 'asc' } } },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const tasks = tenant.onboardingTasks.map((t) => ({
      id: t.id,
      key: t.key,
      title: t.title,
      status: t.status as OnboardingTaskStatus,
      order: t.order,
      completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    }));

    const doneCount = tasks.filter((t) => t.status === OnboardingTaskStatus.DONE).length;
    const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

    return { tenant: this.toSettings(tenant), tasks, progress };
  }

  async updateSettings(tenantId: string, dto: UpdateSettingsDto): Promise<ITenantSettings> {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: dto.name?.trim(),
        logoUrl: dto.logoUrl,
        timezone: dto.timezone,
        currency: dto.currency,
        businessType: dto.businessType?.trim(),
      },
    });
    // Providing workspace details completes the workspace step.
    await this.markDone(tenantId, 'setup_workspace');
    return this.toSettings(tenant);
  }

  /** Sets the tenant's active quotation template. Kept separate so it has no onboarding side-effects. */
  async setDefaultQuoteTemplate(
    tenantId: string,
    template: QuoteTemplate,
  ): Promise<ITenantSettings> {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { defaultQuoteTemplate: template },
    });
    return this.toSettings(tenant);
  }

  async updateProfile(tenantId: string, userId: string, dto: UpdateProfileDto): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name?.trim(), phone: dto.phone?.trim() },
    });
    await this.markDone(tenantId, 'complete_profile');
  }

  async completeStep(tenantId: string, key: string): Promise<IOnboardingState> {
    await this.setStatus(tenantId, key, OnboardingTaskStatus.DONE);
    return this.getState(tenantId);
  }

  async skipStep(tenantId: string, key: string): Promise<IOnboardingState> {
    await this.setStatus(tenantId, key, OnboardingTaskStatus.SKIPPED);
    return this.getState(tenantId);
  }

  async finish(tenantId: string): Promise<ITenantSettings> {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { onboardingCompletedAt: new Date() },
    });
    return this.toSettings(tenant);
  }

  /** Marks a task done if it exists and isn't already done (used by side-effects). */
  async markDone(tenantId: string, key: string): Promise<void> {
    await this.prisma.onboardingTask.updateMany({
      where: { tenantId, key, status: { not: OnboardingTaskStatus.DONE } },
      data: { status: OnboardingTaskStatus.DONE, completedAt: new Date() },
    });
  }

  private async setStatus(
    tenantId: string,
    key: string,
    status: OnboardingTaskStatus,
  ): Promise<void> {
    const result = await this.prisma.onboardingTask.updateMany({
      where: { tenantId, key },
      data: { status, completedAt: status === OnboardingTaskStatus.DONE ? new Date() : null },
    });
    if (result.count === 0) {
      throw new BadRequestException({ message: 'Unknown onboarding step', error: 'UNKNOWN_STEP' });
    }
  }

  private toSettings(tenant: {
    id: string;
    name: string;
    logoUrl: string | null;
    timezone: string;
    currency: string;
    businessType: string | null;
    defaultQuoteTemplate: string;
    onboardingCompletedAt: Date | null;
  }): ITenantSettings {
    return {
      id: tenant.id,
      name: tenant.name,
      logoUrl: tenant.logoUrl,
      timezone: tenant.timezone,
      currency: tenant.currency,
      businessType: tenant.businessType,
      defaultQuoteTemplate: tenant.defaultQuoteTemplate as QuoteTemplate,
      onboardingCompletedAt: tenant.onboardingCompletedAt
        ? tenant.onboardingCompletedAt.toISOString()
        : null,
    };
  }
}
