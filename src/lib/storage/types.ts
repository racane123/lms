export interface StorageService {
  upload(input: { key: string; data: Buffer; contentType: string }): Promise<{ key: string; url: string }>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}
