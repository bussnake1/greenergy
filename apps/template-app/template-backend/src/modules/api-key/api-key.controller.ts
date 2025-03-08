import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyService, CreateApiKeyDto } from './api-key.service';
import { JwtAuthGuard } from 'shared/auth';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    username: string;
  };
}

@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createApiKey(
    @Body() createApiKeyDto: CreateApiKeyDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    return this.apiKeyService.createApiKey(userId, createApiKeyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getApiKeys(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.apiKeyService.getApiKeys(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getApiKeyById(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.apiKeyService.getApiKeyById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async revokeApiKey(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    await this.apiKeyService.revokeApiKey(id, userId);
    return { message: 'API key revoked successfully' };
  }
}
