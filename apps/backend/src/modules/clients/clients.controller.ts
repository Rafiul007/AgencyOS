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
import { ClientStatus, UserRole } from '@agencyos/shared';
import type { IClient } from '@agencyos/shared';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  list(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: ClientStatus,
    @Query('search') search?: string,
  ): Promise<IClient[]> {
    return this.clientsService.findAll(tenantId, { status, search });
  }

  @Get(':id')
  get(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string): Promise<IClient> {
    return this.clientsService.findOne(tenantId, id);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT)
  @Post()
  create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateClientDto,
  ): Promise<IClient> {
    return this.clientsService.create(tenantId, dto);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT)
  @Patch(':id')
  update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ): Promise<IClient> {
    return this.clientsService.update(tenantId, id, dto);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string): Promise<void> {
    await this.clientsService.remove(tenantId, id);
  }
}
