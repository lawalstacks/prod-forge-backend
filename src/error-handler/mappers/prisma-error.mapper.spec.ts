import { HttpStatus } from '@nestjs/common';

import { PrismaClientKnownRequestError } from '../../../database-manager/generated/internal/prismaNamespace';
import {
  DatabaseNotFoundError,
  DatabaseUniqueConstraintError,
  DatabaseValidationError,
} from '../errors/database.errors';
import { mapPrismaError } from './prisma-error.mapper';

const CLIENT_VERSION = '1.0.0';

const makePrismaError = (code: string, meta?: Record<string, unknown>): PrismaClientKnownRequestError => {
  return new PrismaClientKnownRequestError('Prisma error', { clientVersion: CLIENT_VERSION, code, meta });
};

describe('mapPrismaError', () => {
  describe('negative cases', () => {
    it('returns null for a plain Error', () => {
      expect(mapPrismaError(new Error('random'))).toBeNull();
    });

    it('returns null for null', () => {
      expect(mapPrismaError(null)).toBeNull();
    });

    it('returns null for a string', () => {
      expect(mapPrismaError('some string')).toBeNull();
    });

    it('returns null for an unknown Prisma error code', () => {
      const err = makePrismaError('P9999');

      expect(mapPrismaError(err)).toBeNull();
    });

    it('returns null for an unrecognised Prisma code (P2001)', () => {
      const err = makePrismaError('P2001');

      expect(mapPrismaError(err)).toBeNull();
    });
  });

  describe('positive cases', () => {
    it('maps P2002 to DatabaseUniqueConstraintError with CONFLICT status', () => {
      const err = makePrismaError('P2002', { target: ['email'] });

      const result = mapPrismaError(err);

      expect(result).toBeInstanceOf(DatabaseUniqueConstraintError);
      expect(result?.status).toBe(HttpStatus.CONFLICT);
    });

    it('maps P2002 and passes meta as details', () => {
      const meta = { target: ['email'] };
      const err = makePrismaError('P2002', meta);

      const result = mapPrismaError(err);

      expect(result?.details).toEqual(meta);
    });

    it('maps P2007 to DatabaseValidationError with BAD_REQUEST status', () => {
      const err = makePrismaError('P2007');

      const result = mapPrismaError(err);

      expect(result).toBeInstanceOf(DatabaseValidationError);
      expect(result?.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('maps P2025 to DatabaseNotFoundError with NOT_FOUND status', () => {
      const err = makePrismaError('P2025', { cause: 'Record not found' });

      const result = mapPrismaError(err);

      expect(result).toBeInstanceOf(DatabaseNotFoundError);
      expect(result?.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('maps P2025 and passes meta as details', () => {
      const meta = { cause: 'Record not found' };
      const err = makePrismaError('P2025', meta);

      const result = mapPrismaError(err);

      expect(result?.details).toEqual(meta);
    });
  });
});
