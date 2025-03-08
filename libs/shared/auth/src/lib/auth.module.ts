import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './services/auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

export interface JwtModuleOptions {
  secret: string;
  expiresIn?: string;
  ignoreExpiration?: boolean;
}

export interface AuthModuleOptions {
  jwt: JwtModuleOptions;
}

export interface AuthModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<AuthModuleOptions> | AuthModuleOptions;
  inject?: any[];
  imports?: any[];
}

@Module({})
export class AuthModule {
  static register(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: options.jwt.secret,
          signOptions: { 
            expiresIn: options.jwt.expiresIn || '1h',
          },
        }),
      ],
      providers: [
        {
          provide: 'AUTH_OPTIONS',
          useValue: options,
        },
        JwtStrategy,
        AuthService,
        JwtAuthGuard,
      ],
      exports: [JwtModule, AuthService, JwtAuthGuard],
    };
  }

  static registerAsync(options: AuthModuleAsyncOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            return {
              secret: config.jwt.secret,
              signOptions: { 
                expiresIn: config.jwt.expiresIn || '1h',
                ignoreExpiration: config.jwt.ignoreExpiration,
              },
            };
          },
          inject: options.inject || [],
        }),
        ...(options.imports || []),
      ],
      providers: [
        {
          provide: 'AUTH_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        JwtStrategy,
        AuthService,
        JwtAuthGuard,
      ],
      exports: [JwtModule, AuthService, JwtAuthGuard],
    };
  }
}
