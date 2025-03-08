export * from './lib/auth.module';
export * from './lib/services/auth.service';
export * from './lib/guards/jwt-auth.guard';
export * from './lib/strategies/jwt.strategy';

// Re-export commonly used decorators from @nestjs/passport for convenience
export { UseGuards } from '@nestjs/common';
