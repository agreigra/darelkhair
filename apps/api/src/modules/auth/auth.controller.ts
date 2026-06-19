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
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { REFRESH_COOKIE, refreshCookieOptions } from './auth.cookies';
import type { PublicUser, RequestContext } from './types/auth.types';

interface SessionResponse {
  user: PublicUser;
  accessToken: string;
}

interface RegisterResponse {
  verificationRequired: true;
  email: string;
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
  ): Promise<RegisterResponse> {
    // No session is issued — the user must verify their email before logging in.
    const { email } = await this.auth.register(dto, this.context(req));
    return { verificationRequired: true, email };
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
    res.clearCookie(
      REFRESH_COOKIE,
      refreshCookieOptions(this.config.isProduction, this.config.cookieSameSite),
    );
    return { success: true };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.auth.forgotPassword(dto, this.context(req));
    // Always 200 — never reveal whether the email is registered.
    return { success: true };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.auth.resetPassword(dto, this.context(req));
    return { success: true };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.auth.verifyEmail(dto, this.context(req));
    return { success: true };
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(
    @Body() dto: ResendVerificationDto,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.auth.resendVerification(dto, this.context(req));
    // Always 200 — never reveal whether the email exists or is already verified.
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
      refreshCookieOptions(
        this.config.isProduction,
        this.config.cookieSameSite,
        result.refreshTokenExpiresAt,
      ),
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
