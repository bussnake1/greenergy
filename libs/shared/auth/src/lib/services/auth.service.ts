import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthModuleOptions } from '../auth.module';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('AUTH_OPTIONS') private readonly options: AuthModuleOptions
  ) {}

  async generateAccessToken(payload: Record<string, any>): Promise<string> {
    return this.jwtService.sign(payload, {
      expiresIn: this.options.jwt.expiresIn || '1h'
    });
  }

  async generateRefreshToken(payload: Record<string, any>): Promise<string> {
    // Use a longer expiration time for refresh tokens
    // Excluding some sensitive data from refresh token payload is a good practice
    const refreshPayload = {
      sub: payload.sub,
      email: payload.email,
      type: 'refresh'
    };
    
    return this.jwtService.sign(refreshPayload, {
      expiresIn: '7d' // Refresh tokens typically have a longer lifespan
    });
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      
      // Additional check to ensure it's a refresh token
      if (payload.type !== 'refresh') {
        throw new Error('Not a refresh token');
      }
      
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async decodeToken(token: string): Promise<any> {
    return this.jwtService.decode(token);
  }
}
