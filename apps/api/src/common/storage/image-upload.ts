import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

/**
 * Accepted image types and their file extension. Single source of truth shared
 * by the Multer `fileFilter` (early rejection) and the StorageService (key
 * extension). Adding a format here enables it everywhere.
 */
export const IMAGE_MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export const IMAGE_MIME_TYPES = Object.keys(IMAGE_MIME_EXTENSIONS);

/**
 * Hard memory backstop so Multer never buffers an unbounded request body into
 * memory before our validators run. This is a ceiling, not the business rule —
 * the precise, configurable per-upload limit (`MAX_UPLOAD_SIZE_MB`, default 5 MB)
 * is still enforced in the service after the file is received.
 */
export const MAX_IMAGE_UPLOAD_BYTES = 15 * 1024 * 1024;

/**
 * Shared Multer options for image upload endpoints (payment proofs, apartment
 * photos): reject non-images and oversized/extra files at the stream level,
 * before anything is buffered or written to storage.
 */
export const imageUploadOptions: MulterOptions = {
  limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          `Unsupported file type. Allowed: ${IMAGE_MIME_TYPES.join(', ')}`,
        ),
        false,
      );
    }
  },
};
