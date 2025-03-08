import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, originalUrl, ip, body, params, query } = request;
    const userAgent = request.get('user-agent') || '';
    
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    // Log the request
    this.logger.log(
      `[${requestId}] Request: ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
    );
    
    // Log request body if it exists and is not empty
    if (body && Object.keys(body).length > 0) {
      this.logger.debug(
        `[${requestId}] Request Body: ${this.sanitizeData(body)}`,
      );
    }
    
    // Log URL params if they exist
    if (params && Object.keys(params).length > 0) {
      this.logger.debug(
        `[${requestId}] Request Params: ${JSON.stringify(params)}`,
      );
    }
    
    // Log query params if they exist
    if (query && Object.keys(query).length > 0) {
      this.logger.debug(
        `[${requestId}] Request Query: ${JSON.stringify(query)}`,
      );
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          
          this.logger.log(
            `[${requestId}] Response: ${method} ${originalUrl} - Status: ${statusCode} - Duration: ${duration}ms`,
          );
          
          // Log response data in debug level
          if (data) {
            this.logger.debug(
              `[${requestId}] Response Data: ${this.sanitizeData(data)}`,
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          
          this.logger.error(
            `[${requestId}] Error: ${method} ${originalUrl} - Status: ${statusCode} - Duration: ${duration}ms - Message: ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private sanitizeData(data: any): string {
    // Create a copy of the data to avoid modifying the original
    const sanitized = { ...data };
    
    // List of sensitive fields to mask
    const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'apiKey'];
    
    // Recursively sanitize the data
    this.maskSensitiveData(sanitized, sensitiveFields);
    
    return JSON.stringify(sanitized);
  }

  private maskSensitiveData(obj: any, sensitiveFields: string[]): void {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach((key) => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        obj[key] = '***REDACTED***';
      } else if (typeof obj[key] === 'object') {
        this.maskSensitiveData(obj[key], sensitiveFields);
      }
    });
  }
}
