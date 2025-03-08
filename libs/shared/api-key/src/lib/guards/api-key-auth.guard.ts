import {
  CanActivate,
  ExecutionContext,
  Injectable,
  // Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyService } from '../services/api-key.service';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  // private readonly logger = new Logger(ApiKeyAuthGuard.name);

  constructor(private readonly apiKeyService: ApiKeyService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    // The actual validation of the API key will be implemented in the backend module
    // that uses this shared library, as it requires access to the database
    
    // Set the API key in the request for later use
    (request as any).apiKey = apiKey;

    return true;
  }

  private extractApiKey(request: Request): string | undefined {
    const headerName = this.apiKeyService.getHeaderName();
    return request.headers[headerName.toLowerCase()] as string;
  }
}
