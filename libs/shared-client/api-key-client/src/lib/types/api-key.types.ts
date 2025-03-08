export interface ApiKey {
  id: string;
  name: string;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  isActive: boolean;
  userId: string;
}

export interface ApiKeyWithRawKey extends Omit<ApiKey, 'key'> {
  rawKey: string;
}

export interface CreateApiKeyDto {
  name: string;
  expiresAt?: string;
}
