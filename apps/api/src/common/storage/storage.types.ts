export interface UploadParams {
  buffer: Buffer;
  contentType: string;
  /** Logical folder, e.g. "apartments". Keys are namespaced under it. */
  keyPrefix: string;
  /** File extension without the dot, e.g. "jpg". */
  extension: string;
}

export interface UploadResult {
  /** Storage key (path within the bucket / upload dir) — persisted for deletion. */
  key: string;
  /** Public URL the object is served from. */
  url: string;
}

export interface StorageDriver {
  upload(params: UploadParams): Promise<UploadResult>;
  delete(key: string): Promise<void>;
}
