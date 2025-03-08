import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ApiKeyModule } from './modules/api-key/api-key.module';
import { UnavailabilityModule } from './modules/unavailability/unavailability.module';

@Module({
  imports: [AuthModule, PrismaModule, ApiKeyModule, UnavailabilityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
