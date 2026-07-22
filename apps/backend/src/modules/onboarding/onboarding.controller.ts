import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import type { IOnboardingState, ITenantSettings } from '@agencyos/shared';
import { OnboardingService } from './onboarding.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SetQuoteTemplateDto } from './dto/set-quote-template.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  getState(@CurrentUser('tenantId') tenantId: string): Promise<IOnboardingState> {
    return this.onboardingService.getState(tenantId);
  }

  @Patch('settings')
  updateSettings(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateSettingsDto,
  ): Promise<ITenantSettings> {
    return this.onboardingService.updateSettings(tenantId, dto);
  }

  @Patch('quote-template')
  setQuoteTemplate(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: SetQuoteTemplateDto,
  ): Promise<ITenantSettings> {
    return this.onboardingService.setDefaultQuoteTemplate(tenantId, dto.defaultQuoteTemplate);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<{ ok: true }> {
    await this.onboardingService.updateProfile(tenantId, userId, dto);
    return { ok: true };
  }

  @Post('steps/:key/complete')
  complete(
    @CurrentUser('tenantId') tenantId: string,
    @Param('key') key: string,
  ): Promise<IOnboardingState> {
    return this.onboardingService.completeStep(tenantId, key);
  }

  @Post('steps/:key/skip')
  skip(
    @CurrentUser('tenantId') tenantId: string,
    @Param('key') key: string,
  ): Promise<IOnboardingState> {
    return this.onboardingService.skipStep(tenantId, key);
  }

  @Post('complete')
  finish(@CurrentUser('tenantId') tenantId: string): Promise<ITenantSettings> {
    return this.onboardingService.finish(tenantId);
  }
}
