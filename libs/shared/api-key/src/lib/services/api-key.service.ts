import { Inject, Injectable } from '@nestjs/common';
import { ApiKeyModuleOptions } from '../api-key.module';
import * as crypto from 'crypto';

export interface ApiKeyData {
  id: string;
  name: string;
  key: string;
  userId: string;
  createdAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  isActive: boolean;
}

export interface ApiKeyCreateOptions {
  name: string;
  userId: string;
  expiresAt?: Date;
}

@Injectable()
export class ApiKeyService {
  // private readonly logger = new Logger(ApiKeyService.name);
  private readonly headerName: string;

  constructor(
    @Inject('API_KEY_OPTIONS')
    readonly options: ApiKeyModuleOptions,
  ) {
    this.headerName = options.headerName || 'x-api-key';
  }

  /**
   * Generate a new API key
   */
  generateApiKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash an API key for storage
   */
  hashApiKey(apiKey: string): string {
    return crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');
  }

  /**
   * Get the header name used for API key authentication
   */
  getHeaderName(): string {
    return this.headerName;
  }
}
