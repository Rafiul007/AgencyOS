import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';
import { MAX_SUB_USERS, UserRole } from '@agencyos/shared';
import type { IAuthUser, ITeamMember } from '@agencyos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { CreateSubUserDto } from './dto/create-sub-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly onboarding: OnboardingService,
  ) {}

  /** Creates a sub-user within the caller's tenant, enforcing the per-account limit. */
  async createSubUser(tenantId: string, dto: CreateSubUserDto): Promise<IAuthUser> {
    // The Owner role is reserved for the subscriber and cannot be assigned to sub-users.
    if (dto.role === UserRole.OWNER) {
      throw new BadRequestException({
        message: 'Cannot create another Owner',
        error: 'INVALID_ROLE',
      });
    }

    const subscription = await this.prisma.subscription.findUnique({ where: { tenantId } });
    const limit = subscription?.maxSubUsers ?? MAX_SUB_USERS;

    const subUserCount = await this.prisma.user.count({
      where: { tenantId, role: { not: UserRole.OWNER } },
    });
    if (subUserCount >= limit) {
      throw new ForbiddenException({
        message: `Sub-user limit reached (${limit})`,
        error: 'SUB_USER_LIMIT_REACHED',
      });
    }

    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException({ message: 'Email is already registered', error: 'EMAIL_TAKEN' });
    }

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email,
        name: dto.name.trim(),
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        role: dto.role,
      },
    });

    // Adding a teammate completes the "invite your team" onboarding step.
    await this.onboarding.markDone(tenantId, 'invite_team');

    return this.toAuthUser(user);
  }

  /** Lists all team members in the caller's tenant (tenant-scoped). */
  async listTenantUsers(tenantId: string): Promise<ITeamMember[]> {
    const users = await this.prisma.user.findMany({
      where: { tenantId },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    });
    return users.map((u) => this.toTeamMember(u));
  }

  /** Updates a teammate's role and/or active state, guarding the Owner and self. */
  async updateMember(
    tenantId: string,
    actingUserId: string,
    targetId: string,
    dto: UpdateUserDto,
  ): Promise<ITeamMember> {
    const target = await this.getOwned(tenantId, targetId);
    if (target.role === UserRole.OWNER) {
      throw new ForbiddenException({
        message: 'The Owner cannot be modified',
        error: 'OWNER_LOCKED',
      });
    }
    if (target.id === actingUserId) {
      throw new BadRequestException({
        message: 'You cannot change your own role or status',
        error: 'CANNOT_EDIT_SELF',
      });
    }
    if (dto.role === UserRole.OWNER) {
      throw new BadRequestException({
        message: 'Cannot promote a member to Owner',
        error: 'INVALID_ROLE',
      });
    }
    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data: {
        role: dto.role ?? undefined,
        isActive: dto.isActive ?? undefined,
      },
    });
    return this.toTeamMember(updated);
  }

  /** Removes a teammate, guarding the Owner and self. */
  async removeMember(tenantId: string, actingUserId: string, targetId: string): Promise<void> {
    const target = await this.getOwned(tenantId, targetId);
    if (target.role === UserRole.OWNER) {
      throw new ForbiddenException({
        message: 'The Owner cannot be removed',
        error: 'OWNER_LOCKED',
      });
    }
    if (target.id === actingUserId) {
      throw new BadRequestException({
        message: 'You cannot remove yourself',
        error: 'CANNOT_REMOVE_SELF',
      });
    }
    await this.prisma.user.delete({ where: { id: targetId } });
  }

  private async getOwned(tenantId: string, id: string): Promise<User> {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) {
      throw new NotFoundException({ message: 'Team member not found', error: 'USER_NOT_FOUND' });
    }
    return user;
  }

  private toTeamMember(user: User): ITeamMember {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as ITeamMember['role'],
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  }): IAuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as IAuthUser['role'],
      tenantId: user.tenantId,
    };
  }
}
