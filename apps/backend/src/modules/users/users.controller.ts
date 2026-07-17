import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserRole } from '@agencyos/shared';
import type { IAuthUser } from '@agencyos/shared';
import { UsersService } from './users.service';
import { CreateSubUserDto } from './dto/create-sub-user.dto';
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
  list(@CurrentUser('tenantId') tenantId: string): Promise<IAuthUser[]> {
    return this.usersService.listTenantUsers(tenantId);
  }
}
