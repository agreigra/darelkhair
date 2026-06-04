import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './env.validation';

/**
 * Typed accessor over ConfigService. Features inject this instead of reading
 * raw process.env, so config stays validated and type-safe (no `any`).
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get nodeEnv(): Env['NODE_ENV'] {
    return this.config.get('NODE_ENV', { infer: true });
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get port(): number {
    return this.config.get('API_PORT', { infer: true });
  }

  get databaseUrl(): string {
    return this.config.get('DATABASE_URL', { infer: true });
  }

  get corsOrigins(): string[] {
    return this.config
      .get('CORS_ORIGINS', { infer: true })
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  }

  get jwt() {
    return {
      accessSecret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
      accessExpiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', { infer: true }),
      refreshSecret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
      refreshExpiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', {
        infer: true,
      }),
    };
  }

  get upload() {
    return {
      dir: this.config.get('UPLOAD_DIR', { infer: true }),
      maxSizeMb: this.config.get('MAX_UPLOAD_SIZE_MB', { infer: true }),
    };
  }

  get apiPublicUrl(): string {
    return this.config.get('API_PUBLIC_URL', { infer: true });
  }

  get storage() {
    return {
      driver: this.config.get('STORAGE_DRIVER', { infer: true }),
      uploadDir: this.config.get('UPLOAD_DIR', { infer: true }),
      maxSizeMb: this.config.get('MAX_UPLOAD_SIZE_MB', { infer: true }),
      r2: {
        accountId: this.config.get('R2_ACCOUNT_ID', { infer: true }),
        accessKeyId: this.config.get('R2_ACCESS_KEY_ID', { infer: true }),
        secretAccessKey: this.config.get('R2_SECRET_ACCESS_KEY', {
          infer: true,
        }),
        bucket: this.config.get('R2_BUCKET', { infer: true }),
        publicUrl: this.config.get('R2_PUBLIC_URL', { infer: true }),
      },
    };
  }
}
