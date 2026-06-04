import { randomUUID } from 'node:crypto';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type {
  StorageDriver,
  UploadParams,
  UploadResult,
} from '../storage.types';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
}

/**
 * Cloudflare R2 storage via its S3-compatible API. R2 uses region "auto" and an
 * account-scoped endpoint; objects are served from the configured public URL
 * (an r2.dev domain or a custom domain bound to the bucket).
 */
export class R2StorageDriver implements StorageDriver {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(config: R2Config) {
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl.replace(/\/$/, '');
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(params: UploadParams): Promise<UploadResult> {
    const key = `${params.keyPrefix}/${randomUUID()}.${params.extension}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: params.buffer,
        ContentType: params.contentType,
      }),
    );
    return { key, url: `${this.publicUrl}/${key}` };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
