import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { LoggingInterceptor, HttpExceptionFilter } from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Apply global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:4200', 'https://greenergy.bussnake.hu'],
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix('api');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Nest Greenergy app')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const port = process.env.PORT ?? 3333;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation is available at: http://localhost:${port}/api`);
  logger.log(`API endpoints are available at: http://localhost:${port}/api/...`);
}
bootstrap();
