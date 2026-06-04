import 'reflect-metadata';
import { join, isAbsolute } from 'node:path';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: false,
  });
  const config = app.get(AppConfigService);

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  // Serve locally-stored uploads (STORAGE_DRIVER=local) at /uploads/*.
  // With R2 the bucket serves files directly, so this is just a dev convenience.
  if (config.storage.driver === 'local') {
    const dir = config.storage.uploadDir;
    app.useStaticAssets(isAbsolute(dir) ? dir : join(process.cwd(), dir), {
      prefix: '/uploads/',
    });
  }

  // Strict DTO validation everywhere — required by the security rules.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
  });

  await app.listen(config.port, '0.0.0.0');
  Logger.log(
    `API ready on http://localhost:${config.port}/api`,
    'Bootstrap',
  );
}

void bootstrap();
