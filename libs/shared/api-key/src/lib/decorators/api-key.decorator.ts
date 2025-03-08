import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Parameter decorator to extract the API key from the request
 * @example
 * ```typescript
 * @Get()
 * findAll(@ApiKey() apiKey: string) {
 *   // Use the API key
 * }
 * ```
 */
export const ApiKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request as any).apiKey;
  },
);

/**
 * Injectable decorator for the ApiKey decorator
 * This is needed for the ApiKeyModule to export the decorator
 */
export class ApiKeyDecorator {}
