import { NotFoundException } from '@nestjs/common';

/**
 * Drizzle query result helper to get a single row or throw an error.
 * Usage: .then(existOrThrow('User not found'))
 */
export function existOrThrow<T>(errorOrMessage?: string | Error) {
  return (res: T[]): T => {
    if (!res || res.length === 0) {
      if (errorOrMessage instanceof Error) {
        throw errorOrMessage;
      }
      throw new NotFoundException(errorOrMessage ?? 'Resource not found');
    }
    return res[0];
  };
}
