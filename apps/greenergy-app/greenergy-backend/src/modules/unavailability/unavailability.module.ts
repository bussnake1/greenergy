import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UnavailabilityRepository } from './unavailability.repository';
import { ProductionGenerationUnitsUnavailabilityModule } from '@greenergy/production-generation-units-unavailability';

// Create a module that provides the UnavailabilityRepository
@Module({
  imports: [PrismaModule],
  providers: [
    UnavailabilityRepository,
    {
      provide: 'UNAVAILABILITY_DAL',
      useExisting: UnavailabilityRepository,
    },
  ],
  exports: [UnavailabilityRepository, 'UNAVAILABILITY_DAL'],
})
export class UnavailabilityDALModule {}

@Module({
  imports: [
    PrismaModule,
    UnavailabilityDALModule,
    ProductionGenerationUnitsUnavailabilityModule.registerAsync({
      imports: [UnavailabilityDALModule],
      useFactory: () => ({}),
      inject: [],
    }),
  ],
  exports: [ProductionGenerationUnitsUnavailabilityModule],
})
export class UnavailabilityModule {}
