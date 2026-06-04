import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

/**
 * Global filter that normalizes every error into a consistent JSON shape.
 * Keeps internal details out of production responses.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        message = (r.message as string | string[]) ?? exception.message;
        error = (r.error as string) ?? exception.name;
      }
    } else if (exception instanceof Error && exception.name === 'MulterError') {
      // Upload rejected at the stream level (size / file-count limits).
      const code = (exception as { code?: string }).code;
      status =
        code === 'LIMIT_FILE_SIZE'
          ? HttpStatus.PAYLOAD_TOO_LARGE
          : HttpStatus.BAD_REQUEST;
      message =
        code === 'LIMIT_FILE_SIZE' ? 'File too large' : exception.message;
      error = 'UploadError';
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    const body: ErrorBody = {
      statusCode: status,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }
}
