import { Injectable, NotFoundException } from '@nestjs/common';
import type { Client } from '@prisma/client';
import type { ClientStatus, IClient } from '@agencyos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

interface IListFilters {
  status?: ClientStatus;
  search?: string;
}

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateClientDto): Promise<IClient> {
    const client = await this.prisma.client.create({
      data: {
        tenantId,
        name: dto.name.trim(),
        contactName: dto.contactName?.trim(),
        email: dto.email?.toLowerCase().trim(),
        phone: dto.phone?.trim(),
        address: dto.address?.trim(),
        notes: dto.notes?.trim(),
        status: dto.status ?? 'ACTIVE',
      },
    });
    return this.toDto(client);
  }

  async findAll(tenantId: string, filters: IListFilters = {}): Promise<IClient[]> {
    const clients = await this.prisma.client.findMany({
      where: {
        tenantId,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { contactName: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return clients.map((c) => this.toDto(c));
  }

  async findOne(tenantId: string, id: string): Promise<IClient> {
    return this.toDto(await this.getOwned(tenantId, id));
  }

  async update(tenantId: string, id: string, dto: UpdateClientDto): Promise<IClient> {
    await this.getOwned(tenantId, id);
    const client = await this.prisma.client.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        contactName: dto.contactName?.trim(),
        email: dto.email?.toLowerCase().trim(),
        phone: dto.phone?.trim(),
        address: dto.address?.trim(),
        notes: dto.notes?.trim(),
        status: dto.status,
      },
    });
    return this.toDto(client);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.getOwned(tenantId, id);
    await this.prisma.client.delete({ where: { id } });
  }

  /** Ensures the client exists AND belongs to the caller's tenant (isolation). */
  private async getOwned(tenantId: string, id: string): Promise<Client> {
    const client = await this.prisma.client.findFirst({ where: { id, tenantId } });
    if (!client) {
      throw new NotFoundException({ message: 'Client not found', error: 'CLIENT_NOT_FOUND' });
    }
    return client;
  }

  private toDto(client: Client): IClient {
    return {
      id: client.id,
      tenantId: client.tenantId,
      name: client.name,
      contactName: client.contactName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
      status: client.status as IClient['status'],
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    };
  }
}
