import { HttpStatus } from '@nestjs/common';

import { ErrorCategory } from '../constants/error-category';
import { ErrorCodes } from '../constants/error.codes';
import { BaseError } from './_base.error';

const DEFAULT_MESSAGES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Bad request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Resource not found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable entity',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Too many requests',
  [HttpStatus.I_AM_A_TEAPOT]: 'I am a teapot',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HttpStatus.BAD_GATEWAY]: 'Bad gateway',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Service unavailable',
};

export class HttpExceptionError extends BaseError<void> {
  static code = ErrorCodes.HTTP_EXCEPTION;
  static domain = ErrorCategory.DOMAIN;

  constructor(status: HttpStatus, message?: string) {
    super(
      message || DEFAULT_MESSAGES[status] || 'HTTP Error',
      HttpExceptionError.code,
      HttpExceptionError.domain,
      status,
    );
  }
}
