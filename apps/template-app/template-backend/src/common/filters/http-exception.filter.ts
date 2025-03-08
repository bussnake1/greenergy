import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';
    
    const errorResponse: {
      statusCode: number;
      timestamp: string;
      path: string;
      method: string;
      message: any;
      errorId?: string;
    } = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
    };
    
    // Generate a unique error ID for tracking
    const errorId = this.generateErrorId();
    
    // Log detailed error information
    this.logger.error(
      `[${errorId}] ${request.method} ${request.url} - Status: ${status} - ${this.getErrorMessage(exception)}`,
      this.getErrorStack(exception),
    );
    
    // Log additional request details that might be useful for debugging
    this.logger.debug(`[${errorId}] Request headers: ${JSON.stringify(this.sanitizeHeaders(request.headers))}`);
    if (request.body && Object.keys(request.body).length > 0) {
      this.logger.debug(`[${errorId}] Request body: ${JSON.stringify(this.sanitizeData(request.body))}`);
    }
    
    // Add error ID to the response for correlation
    errorResponse.errorId = errorId;
    
    response.status(status).json(errorResponse);
  }
  
  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null && 'message' in response) {
        return Array.isArray(response['message']) 
          ? response['message'].join(', ') 
          : String(response['message']);
      }
      return String(response);
    }
    
    if (exception instanceof Error) {
      return exception.message;
    }
    
    return String(exception);
  }
  
  private getErrorStack(exception: unknown): string | undefined {
    if (exception instanceof Error) {
      return exception.stack;
    }
    return undefined;
  }
  
  private generateErrorId(): string {
    return `err_${Math.random().toString(36).substring(2, 15)}`;
  }
  
  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '***REDACTED***';
      }
    });
    
    return sanitized;
  }
  
  private sanitizeData(data: any): any {
    // Create a copy of the data to avoid modifying the original
    const sanitized = { ...data };
    
    // List of sensitive fields to mask
    const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'apiKey'];
    
    // Recursively sanitize the data
    this.maskSensitiveData(sanitized, sensitiveFields);
    
    return sanitized;
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
