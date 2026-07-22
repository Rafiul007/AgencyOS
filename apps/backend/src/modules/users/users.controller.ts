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
} from '@nestjs/common';
import { UserRole } from '@agencyos/shared';
import type { IAuthUser, ITeamMember } from '@agencyos/shared';
import { UsersService } from './users.service';
import { CreateSubUserDto } from './dto/create-sub-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Post()
  createSubUser(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateSubUserDto,
  ): Promise<IAuthUser> {
    return this.usersService.createSubUser(tenantId, dto);
  }

  @Get()
  list(@CurrentUser('tenantId') tenantId: string): Promise<ITeamMember[]> {
    return this.usersService.listTenantUsers(tenantId);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Patch(':id')
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actingUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ITeamMember> {
    return this.usersService.updateMember(tenantId, actingUserId, id, dto);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actingUserId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.usersService.removeMember(tenantId, actingUserId, id);
  }
}
