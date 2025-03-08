import { Body, Controller, Get, Logger, OnModuleInit, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'shared/auth';
import type { Request } from 'express';

export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto extends LoginDto {
  username: string;
}

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    username: string;
  };
}

@Controller('auth')
export class AuthController implements OnModuleInit {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  onModuleInit() {
    this.logger.log('Auth endpoints are initialized and ready');
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: RequestWithUser) {
    return req.user;
  }
  @Get('hello')
  async getHello(@Req() req: any) {
    return 'Hello World!';
  }
}
