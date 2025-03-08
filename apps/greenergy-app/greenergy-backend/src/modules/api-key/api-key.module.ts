import { Module } from '@nestjs/common';
import { ApiKeyModule as SharedApiKeyModule } from 'shared/api-key';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ApiKeyAuthGuard } from './guards';

@Module({
  imports: [
    SharedApiKeyModule.register({
      headerName: 'x-api-key',
    }),
    PrismaModule,
  ],
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ApiKeyAuthGuard],
  exports: [ApiKeyService, ApiKeyAuthGuard],
})
export class ApiKeyModule {}
