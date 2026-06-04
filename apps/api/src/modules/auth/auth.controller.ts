import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppConfigService } from '@/config/app.config';
import { AuthService, type AuthResult } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { REFRESH_COOKIE, refreshCookieOptions } from './auth.cookies';
import type { PublicUser, RequestContext } from './types/auth.types';

interface SessionResponse {
  user: PublicUser;
  accessToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: AppConfigService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionResponse> {
    const result = await this.auth.register(dto, this.context(req));
    return this.completeSession(res, result);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionResponse> {
    const result = await this.auth.login(dto, this.context(req));
    return this.completeSession(res, result);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionResponse> {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const result = await this.auth.refresh(token, this.context(req));
    return this.completeSession(res, result);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean }> {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.auth.logout(token, this.context(req));
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions(this.config.isProduction));
    return { success: true };
  }

  @Get('me')
  me(@CurrentUser('id') userId: string): Promise<PublicUser> {
    return this.auth.me(userId);
  }

  // ── helpers ──

  /** Set the refresh cookie and return the body (user + access token). */
  private completeSession(res: Response, result: AuthResult): SessionResponse {
    res.cookie(
      REFRESH_COOKIE,
      result.refreshToken,
      refreshCookieOptions(this.config.isProduction, result.refreshTokenExpiresAt),
    );
    return { user: result.user, accessToken: result.accessToken };
  }

  private context(req: Request): RequestContext {
    return {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
