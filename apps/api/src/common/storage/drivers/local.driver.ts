import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type {
  StorageDriver,
  UploadParams,
  UploadResult,
} from '../storage.types';

/**
 * Disk-backed storage for local development. Files are written under UPLOAD_DIR
 * and served by the API at `${API_PUBLIC_URL}/uploads/<key>`.
 */
export class LocalStorageDriver implements StorageDriver {
  constructor(
    private readonly uploadDir: string,
    private readonly publicBaseUrl: string,
  ) {}

  async upload(params: UploadParams): Promise<UploadResult> {
    const key = `${params.keyPrefix}/${randomUUID()}.${params.extension}`;
    const filePath = join(this.uploadDir, key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, params.buffer);
    return {
      key,
      url: `${this.publicBaseUrl}/uploads/${key}`,
    };
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(join(this.uploadDir, key));
    } catch (err) {
      // Missing file is fine (already gone); rethrow anything else.
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }
}
