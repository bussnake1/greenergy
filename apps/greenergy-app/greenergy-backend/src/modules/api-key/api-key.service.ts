import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiKeyService as SharedApiKeyService } from 'shared/api-key';
import { ApiKey, User } from '@prisma/client';

export interface CreateApiKeyDto {
  name: string;
  expiresAt?: Date;
}

export interface ApiKeyWithoutHash extends Omit<ApiKey, 'key'> {
  user: {
    id: string;
    email: string;
    username: string;
  };
}

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sharedApiKeyService: SharedApiKeyService,
  ) {}

  /**
   * Create a new API key for a user
   */
  async createApiKey(
    userId: string,
    createApiKeyDto: CreateApiKeyDto,
  ): Promise<{ apiKey: ApiKeyWithoutHash; rawKey: string }> {
    // Generate a new API key
    const rawKey = this.sharedApiKeyService.generateApiKey();
    
    // Hash the API key for storage
    const hashedKey = this.sharedApiKeyService.hashApiKey(rawKey);

    // Create the API key in the database
    const apiKey = await this.prisma.apiKey.create({
      data: {
        name: createApiKeyDto.name,
        key: hashedKey,
        expiresAt: createApiKeyDto.expiresAt,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    // Return the API key without the hashed key
    const { key, ...apiKeyWithoutHash } = apiKey;
    return { apiKey: apiKeyWithoutHash, rawKey };
  }

  /**
   * Get all API keys for a user
   */
  async getApiKeys(userId: string): Promise<ApiKeyWithoutHash[]> {
    const apiKeys = await this.prisma.apiKey.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    // Return the API keys without the hashed key
    return apiKeys.map(({ key, ...apiKeyWithoutHash }) => apiKeyWithoutHash);
  }

  /**
   * Get an API key by ID
   */
  async getApiKeyById(id: string, userId: string): Promise<ApiKeyWithoutHash> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!apiKey) {
      throw new NotFoundException(`API key with ID ${id} not found`);
    }

    if (apiKey.userId !== userId) {
      throw new UnauthorizedException('You do not have permission to access this API key');
    }

    // Return the API key without the hashed key
    const { key, ...apiKeyWithoutHash } = apiKey;
    return apiKeyWithoutHash;
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(id: string, userId: string): Promise<void> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: {
        id,
      },
    });

    if (!apiKey) {
      throw new NotFoundException(`API key with ID ${id} not found`);
    }

    if (apiKey.userId !== userId) {
      throw new UnauthorizedException('You do not have permission to revoke this API key');
    }

    await this.prisma.apiKey.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Validate an API key
   */
  async validateApiKey(apiKey: string): Promise<User> {
    // Hash the API key for comparison
    const hashedKey = this.sharedApiKeyService.hashApiKey(apiKey);

    // Find the API key in the database
    const apiKeyRecord = await this.prisma.apiKey.findUnique({
      where: {
        key: hashedKey,
      },
      include: {
        user: true,
      },
    });

    if (!apiKeyRecord) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Check if the API key is active
    if (!apiKeyRecord.isActive) {
      throw new UnauthorizedException('API key is inactive');
    }

    // Check if the API key has expired
    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    // Update the last used timestamp
    await this.prisma.apiKey.update({
      where: {
        id: apiKeyRecord.id,
      },
      data: {
        lastUsedAt: new Date(),
      },
    });

    return apiKeyRecord.user;
  }
}
