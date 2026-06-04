import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { Prisma, User, UserRole } from '@prisma/client';
import { AuditService } from '@/common/audit/audit.service';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import { UsersRepository } from './users.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import type { PaginatedUsers, UserDto } from './types/user.types';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly audit: AuditService,
  ) {}

  // ── self-service ──

  async getProfile(userId: string): Promise<UserDto> {
    return this.toDto(await this.requireUser(userId));
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    ctx: RequestContext,
  ): Promise<UserDto> {
    await this.requireUser(userId);
    const updated = await this.repo.update(userId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    });
    await this.audit.record({
      action: 'user.profile_update',
      userId,
      entity: 'User',
      entityId: userId,
      ...ctx,
    });
    return this.toDto(updated);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    ctx: RequestContext,
  ): Promise<void> {
    const user = await this.requireUser(userId);
    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.repo.update(userId, { passwordHash });
    await this.audit.record({
      action: 'user.password_change',
      userId,
      entity: 'User',
      entityId: userId,
      ...ctx,
    });
  }

  // ── admin ──

  async list(query: UserQueryDto): Promise<PaginatedUsers> {
    const where: Prisma.UserWhereInput = {};
    if (query.role) where.role = query.role;
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const { items, total } = await this.repo.list({
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      where,
    });

    return {
      items: items.map((u) => this.toDto(u)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getById(id: string): Promise<UserDto> {
    return this.toDto(await this.requireUser(id));
  }

  async adminUpdate(
    actorId: string,
    targetId: string,
    dto: AdminUpdateUserDto,
    ctx: RequestContext,
  ): Promise<UserDto> {
    await this.requireUser(targetId);

    // Guard against an admin locking themselves out.
    if (actorId === targetId) {
      if (dto.isActive === false) {
        throw new BadRequestException('You cannot deactivate your own account');
      }
      if (dto.role && dto.role !== ('ADMIN' as UserRole)) {
        throw new BadRequestException('You cannot change your own role');
      }
    }

    const updated = await this.repo.update(targetId, {
      role: dto.role,
      isActive: dto.isActive,
    });
    await this.audit.record({
      action: 'user.admin_update',
      userId: actorId,
      entity: 'User',
      entityId: targetId,
      metadata: { role: dto.role, isActive: dto.isActive },
      ...ctx,
    });
    return this.toDto(updated);
  }

  async remove(
    actorId: string,
    targetId: string,
    ctx: RequestContext,
  ): Promise<void> {
    if (actorId === targetId) {
      throw new BadRequestException('You cannot delete your own account');
    }
    await this.requireUser(targetId);
    await this.repo.delete(targetId);
    await this.audit.record({
      action: 'user.delete',
      userId: actorId,
      entity: 'User',
      entityId: targetId,
      ...ctx,
    });
  }

  // ── internals ──

  private async requireUser(id: string): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private toDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
