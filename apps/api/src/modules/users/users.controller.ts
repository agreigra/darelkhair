import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import type { PaginatedUsers, UserDto } from './types/user.types';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // ── self-service (any authenticated user) ──
  // NOTE: `me` routes are declared before `:id` so 'me' isn't matched as an id.

  @Get('me')
  getProfile(@CurrentUser('id') userId: string): Promise<UserDto> {
    return this.users.getProfile(userId);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
    @Req() req: Request,
  ): Promise<UserDto> {
    return this.users.updateProfile(userId, dto, this.context(req));
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.users.changePassword(userId, dto, this.context(req));
    return { success: true };
  }

  // ── admin only ──

  @Roles(UserRole.ADMIN)
  @Get()
  list(@Query() query: UserQueryDto): Promise<PaginatedUsers> {
    return this.users.list(query);
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  getById(@Param('id') id: string): Promise<UserDto> {
    return this.users.getById(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  adminUpdate(
    @CurrentUser('id') actorId: string,
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
    @Req() req: Request,
  ): Promise<UserDto> {
    return this.users.adminUpdate(actorId, id, dto, this.context(req));
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser('id') actorId: string,
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.users.remove(actorId, id, this.context(req));
    return { success: true };
  }

  private context(req: Request): RequestContext {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }
}
