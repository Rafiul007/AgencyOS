import { Injectable, NotFoundException } from '@nestjs/common';
import type { CatalogItem } from '@prisma/client';
import type { CatalogItemType, ICatalogItem } from '@agencyos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';

interface IListFilters {
  type?: CatalogItemType;
  includeInactive?: boolean;
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCatalogItemDto): Promise<ICatalogItem> {
    const item = await this.prisma.catalogItem.create({
      data: {
        tenantId,
        type: dto.type,
        name: dto.name.trim(),
        description: dto.description?.trim(),
        category: dto.category?.trim(),
        pricingUnit: dto.pricingUnit,
        priceMinor: dto.priceMinor,
        currency: dto.currency ?? 'BDT',
      },
    });
    return this.toDto(item);
  }

  async findAll(tenantId: string, filters: IListFilters = {}): Promise<ICatalogItem[]> {
    const items = await this.prisma.catalogItem.findMany({
      where: {
        tenantId,
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
    return items.map((item) => this.toDto(item));
  }

  async findOne(tenantId: string, id: string): Promise<ICatalogItem> {
    const item = await this.getOwned(tenantId, id);
    return this.toDto(item);
  }

  async update(tenantId: string, id: string, dto: UpdateCatalogItemDto): Promise<ICatalogItem> {
    await this.getOwned(tenantId, id);
    const item = await this.prisma.catalogItem.update({
      where: { id },
      data: {
        type: dto.type,
        name: dto.name?.trim(),
        description: dto.description?.trim(),
        category: dto.category?.trim(),
        pricingUnit: dto.pricingUnit,
        priceMinor: dto.priceMinor,
        currency: dto.currency,
        isActive: dto.isActive,
      },
    });
    return this.toDto(item);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.getOwned(tenantId, id);
    await this.prisma.catalogItem.delete({ where: { id } });
  }

  /** Ensures the item exists AND belongs to the caller's tenant (isolation). */
  private async getOwned(tenantId: string, id: string): Promise<CatalogItem> {
    const item = await this.prisma.catalogItem.findFirst({ where: { id, tenantId } });
    if (!item) {
      throw new NotFoundException({
        message: 'Catalog item not found',
        error: 'CATALOG_ITEM_NOT_FOUND',
      });
    }
    return item;
  }

  private toDto(item: CatalogItem): ICatalogItem {
    return {
      id: item.id,
      tenantId: item.tenantId,
      type: item.type as ICatalogItem['type'],
      name: item.name,
      description: item.description,
      category: item.category,
      pricingUnit: item.pricingUnit as ICatalogItem['pricingUnit'],
      priceMinor: item.priceMinor,
      currency: item.currency,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
