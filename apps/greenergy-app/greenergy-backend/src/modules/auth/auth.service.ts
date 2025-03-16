import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService as JwtAuthService } from 'shared/auth';
import { RegisterDto } from './auth.controller';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly prisma: PrismaService
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: registerDto.email },
          { username: registerDto.username }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create the user in the database
    const newUser = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        username: registerDto.username,
        password: hashedPassword,
      }
    });

    // Return user without password
    const { password: _, ...result } = newUser;
    return result;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { sub: user.id, email: user.email, username: user.username };
    return {
      user,
      access_token: await this.jwtAuthService.generateAccessToken(payload),
      refresh_token: await this.jwtAuthService.generateRefreshToken(payload),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token is valid
      const payload = await this.jwtAuthService.verifyRefreshToken(refreshToken);
      
      // Find the user to ensure they still exist and are active
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      });
      
      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }
      
      // Generate a new access token
      const newPayload = { sub: user.id, email: user.email, username: user.username };
      const access_token = await this.jwtAuthService.generateAccessToken(newPayload);
      
      // Optionally, you could issue a new refresh token too
      // const refresh_token = await this.jwtAuthService.generateRefreshToken(newPayload);
      
      return {
        access_token,
        // refresh_token, // Uncomment if you want to issue a new refresh token
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
