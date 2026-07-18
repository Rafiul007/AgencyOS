import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { MAX_SUB_USERS, UserRole } from '@agencyos/shared';
import type { IAuthUser } from '@agencyos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { CreateSubUserDto } from './dto/create-sub-user.dto';

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

  /** Lists all users in the caller's tenant (tenant-scoped). */
  async listTenantUsers(tenantId: string): Promise<IAuthUser[]> {
    const users = await this.prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });
    return users.map((u) => this.toAuthUser(u));
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
