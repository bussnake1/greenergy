import { DynamicModule, Module } from '@nestjs/common';
import { ApiKeyService } from './services/api-key.service';
import { ApiKeyAuthGuard } from './guards/api-key-auth.guard';
import { ApiKeyDecorator } from './decorators/api-key.decorator';

export interface ApiKeyModuleOptions {
  /**
   * Header name to extract the API key from
   * @default 'x-api-key'
   */
  headerName?: string;
}

export interface ApiKeyModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<ApiKeyModuleOptions> | ApiKeyModuleOptions;
  inject?: any[];
  imports?: any[];
}

@Module({})
export class ApiKeyModule {
  static register(options: ApiKeyModuleOptions = {}): DynamicModule {
    return {
      module: ApiKeyModule,
      providers: [
        {
          provide: 'API_KEY_OPTIONS',
          useValue: options,
        },
        ApiKeyService,
        ApiKeyAuthGuard,
        ApiKeyDecorator,
      ],
      exports: [ApiKeyService, ApiKeyAuthGuard, ApiKeyDecorator],
    };
  }

  static registerAsync(options: ApiKeyModuleAsyncOptions): DynamicModule {
    return {
      module: ApiKeyModule,
      imports: [...(options.imports || [])],
      providers: [
        {
          provide: 'API_KEY_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        ApiKeyService,
        ApiKeyAuthGuard,
        ApiKeyDecorator,
      ],
      exports: [ApiKeyService, ApiKeyAuthGuard, ApiKeyDecorator],
    };
  }
}
