import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '@/config/app.config';
import { LocalStorageDriver } from './drivers/local.driver';
import { R2StorageDriver } from './drivers/r2.driver';
import type {
  StorageDriver,
  UploadParams,
  UploadResult,
} from './storage.types';
import { IMAGE_MIME_EXTENSIONS as MIME_EXTENSIONS } from './image-upload';

/**
 * Facade over the configured storage backend (Cloudflare R2 or local disk).
 * Features inject this and never touch a driver directly.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver: StorageDriver;

  constructor(config: AppConfigService) {
    const s = config.storage;
    if (s.driver === 'r2') {
      this.driver = new R2StorageDriver({
        accountId: s.r2.accountId as string,
        accessKeyId: s.r2.accessKeyId as string,
        secretAccessKey: s.r2.secretAccessKey as string,
        bucket: s.r2.bucket as string,
        publicUrl: s.r2.publicUrl as string,
      });
      this.logger.log('Storage driver: Cloudflare R2');
    } else {
      this.driver = new LocalStorageDriver(s.uploadDir, config.apiPublicUrl);
      this.logger.log('Storage driver: local disk');
    }
  }

  /** Accepted upload content types (image formats). */
  get allowedMimeTypes(): string[] {
    return Object.keys(MIME_EXTENSIONS);
  }

  extensionFor(mimeType: string): string | undefined {
    return MIME_EXTENSIONS[mimeType];
  }

  upload(params: UploadParams): Promise<UploadResult> {
    return this.driver.upload(params);
  }

  delete(key: string): Promise<void> {
    return this.driver.delete(key);
  }
}
