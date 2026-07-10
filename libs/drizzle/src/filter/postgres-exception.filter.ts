import { Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

interface PostgresError extends Error {
  code: string;
  detail?: string;
}

function isPostgresError(error: unknown): error is PostgresError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  );
}

@Catch()
export class PostgresExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PostgresExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    // Check if it's a PostgresError (they usually have a 'code' and 'detail' property)
    if (isPostgresError(exception) && exception.code.length === 5) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Database Error';

      switch (exception.code) {
        case '23505': // unique_violation
          status = HttpStatus.CONFLICT;
          message = 'Duplicate data entry';
          break;
        case '23503': // foreign_key_violation
        case '23502': // not_null_violation
        case '22P02': // invalid_text_representation
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid data relation';
          break;
      }

      this.logger.error(
        `Postgres Error [${exception.code}]: ${exception.message} - ${exception.detail}`,
        exception.stack,
      );

      return response.status(status).json({
        statusCode: status,
        message,
        error: HttpStatus[status],
      });
    }

    // If it's not a Postgres error, delegate to the default NestJS exception handler
    super.catch(exception, host);
  }
}
