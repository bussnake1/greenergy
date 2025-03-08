import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyAuthGuard as SharedApiKeyAuthGuard } from 'shared/api-key';
import { ApiKeyService } from '../api-key.service';
import { Request } from 'express';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyAuthGuard.name);

  constructor(
    private readonly sharedApiKeyAuthGuard: SharedApiKeyAuthGuard,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, use the shared guard to extract the API key
    const canActivate = await this.sharedApiKeyAuthGuard.canActivate(context);
    if (!canActivate) {
      return false;
    }

    // Get the request
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = (request as any).apiKey;

    try {
      // Validate the API key and get the associated user
      const user = await this.apiKeyService.validateApiKey(apiKey);

      // Set the user in the request
      (request as any).user = {
        sub: user.id,
        email: user.email,
        username: user.username,
      };

      return true;
    } catch (error: any) {
      this.logger.error(`API key validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
