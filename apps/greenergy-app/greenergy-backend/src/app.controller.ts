import { Controller, Get, Logger, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController implements OnModuleInit {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  onModuleInit() {
    this.logger.log('Root endpoints are initialized and ready');
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
