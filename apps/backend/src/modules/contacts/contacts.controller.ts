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
import { ContactStage, UserRole } from '@agencyos/shared';
import type { IContact } from '@agencyos/shared';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { MoveStageDto } from './dto/move-stage.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ImportContactsDto } from './dto/import-contacts.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

const WRITE_ROLES = [UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT] as const;

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  list(
    @CurrentUser('tenantId') tenantId: string,
    @Query('stage') stage?: ContactStage,
    @Query('search') search?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('tag') tag?: string,
    @Query('followUpDue') followUpDue?: string,
  ): Promise<IContact[]> {
    return this.contactsService.findAll(tenantId, {
      stage,
      search,
      assignedToId,
      tag,
      followUpDue: followUpDue === 'true',
    });
  }

  @Get(':id')
  get(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string): Promise<IContact> {
    return this.contactsService.findOne(tenantId, id);
  }

  @Roles(...WRITE_ROLES)
  @Post()
  create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateContactDto,
  ): Promise<IContact> {
    return this.contactsService.create(tenantId, dto);
  }

  @Roles(...WRITE_ROLES)
  @Post('import')
  import(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: ImportContactsDto,
  ): Promise<{ created: number }> {
    return this.contactsService.importMany(tenantId, dto.contacts);
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id')
  update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
  ): Promise<IContact> {
    return this.contactsService.update(tenantId, id, dto);
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id/stage')
  moveStage(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: MoveStageDto,
  ): Promise<IContact> {
    return this.contactsService.moveStage(tenantId, id, dto.stage);
  }

  @Roles(...WRITE_ROLES)
  @Post(':id/activities')
  logActivity(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateActivityDto,
  ): Promise<IContact> {
    return this.contactsService.logActivity(tenantId, userId, id, dto);
  }

  @Roles(...WRITE_ROLES)
  @Post(':id/convert')
  convert(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string): Promise<IContact> {
    return this.contactsService.convert(tenantId, id);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string): Promise<void> {
    await this.contactsService.remove(tenantId, id);
  }
}
