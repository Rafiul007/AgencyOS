import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CatalogItemType, UserRole } from '@agencyos/shared';
import type { ICatalogItem } from '@agencyos/shared';
import { CatalogService } from './catalog.service';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('catalog/items')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  list(
    @CurrentUser('tenantId') tenantId: string,
    @Query('type') type?: CatalogItemType,
    @Query('includeInactive') includeInactive?: string,
  ): Promise<ICatalogItem[]> {
    return this.catalogService.findAll(tenantId, {
      type,
      includeInactive: includeInactive === 'true',
    });
  }

  @Get(':id')
  get(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string): Promise<ICatalogItem> {
    return this.catalogService.findOne(tenantId, id);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @Post()
  create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateCatalogItemDto,
  ): Promise<ICatalogItem> {
    return this.catalogService.create(tenantId, dto);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @Patch(':id')
  update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCatalogItemDto,
  ): Promise<ICatalogItem> {
    return this.catalogService.update(tenantId, id, dto);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string): Promise<void> {
    await this.catalogService.remove(tenantId, id);
  }
}
