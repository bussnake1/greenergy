import { DynamicModule, Module } from '@nestjs/common';
import { UnavailabilityService } from './services/unavailability.service';
import { UnavailabilityController } from './controllers/unavailability.controller';

export interface UnavailabilityModuleOptions {
  // Any configuration options for the module
}

export interface UnavailabilityModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<UnavailabilityModuleOptions> | UnavailabilityModuleOptions;
  inject?: any[];
  imports?: any[];
}

@Module({})
export class ProductionGenerationUnitsUnavailabilityModule {
  static register(options: UnavailabilityModuleOptions = {}): DynamicModule {
    return {
      module: ProductionGenerationUnitsUnavailabilityModule,
      controllers: [UnavailabilityController],
      providers: [
        {
          provide: 'UNAVAILABILITY_OPTIONS',
          useValue: options,
        },
        UnavailabilityService,
      ],
      exports: [UnavailabilityService],
    };
  }

  static registerAsync(options: UnavailabilityModuleAsyncOptions): DynamicModule {
    return {
      module: ProductionGenerationUnitsUnavailabilityModule,
      imports: [...(options.imports || [])],
      controllers: [UnavailabilityController],
      providers: [
        {
          provide: 'UNAVAILABILITY_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        UnavailabilityService,
      ],
      exports: [UnavailabilityService],
      global: true, // Make the module global to make UNAVAILABILITY_DAL available everywhere
    };
  }
}
