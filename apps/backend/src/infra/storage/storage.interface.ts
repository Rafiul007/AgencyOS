/**
 * File storage abstraction (S3-compatible). Dev may use MinIO; prod a real bucket.
 * Business code depends only on this interface.
 */
export interface IFileStorage {
  put(key: string, body: Buffer, contentType: string): Promise<string>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  delete(key: string): Promise<void>;
}

export const FILE_STORAGE = Symbol('FILE_STORAGE');
