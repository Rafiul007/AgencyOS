import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import type { IApiError } from '@agencyos/shared';

/**
 * Global exception filter. Converts every thrown error into the standard API
 * error envelope so clients always receive a consistent { code, message, details, timestamp }.
 * Full errors are logged server-side; internal details never leak to the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let details: unknown | null = null;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, unknown>;
        message = (body.message as string) ?? exception.message;
        code = (body.error as string)?.toUpperCase().replace(/\s+/g, '_') ?? code;
        details = body.details ?? null;
      }
      code = code === 'INTERNAL_SERVER_ERROR' ? httpStatusToCode(status) : code;
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`${request.method} ${request.url}`, exception as Error);
    }

    const payload: IApiError = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(payload);
  }
}

function httpStatusToCode(status: number): string {
  return (HttpStatus[status] ?? 'ERROR').toString();
}
