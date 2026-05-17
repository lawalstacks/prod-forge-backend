import { Test } from '@nestjs/testing';

import { LoggerService } from '../../../logger/logger.service';
import { RedisManagerService } from '../redis-manager.service';
import { CacheStorage } from './cache.storage';

const makeRedisMock = (): Record<string, jest.Mock> => ({
  del: jest.fn().mockResolvedValue(1),
  get: jest.fn().mockResolvedValue(null),
  keys: jest.fn().mockResolvedValue([]),
  set: jest.fn().mockResolvedValue('OK'),
});

describe('CacheStorage', () => {
  let storage: CacheStorage;
  let redisMock: ReturnType<typeof makeRedisMock>;
  let logger: { error: jest.Mock; warn: jest.Mock };

  beforeEach(async () => {
    redisMock = makeRedisMock();

    const redisManager = { getCacheRedis: jest.fn().mockReturnValue(redisMock) };
    logger = { error: jest.fn(), warn: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        CacheStorage,
        { provide: RedisManagerService, useValue: redisManager },
        { provide: LoggerService, useValue: logger },
      ],
    }).compile();

    storage = module.get(CacheStorage);
  });

  describe('negative cases', () => {
    it('del swallows redis error and logs warning', async () => {
      redisMock.del.mockRejectedValue(new Error('redis error'));

      await expect(storage.del('key')).resolves.toBeUndefined();
      expect(logger.warn).toHaveBeenCalled();
    });

    it('delByPattern swallows redis error and logs warning', async () => {
      redisMock.keys.mockRejectedValue(new Error('redis error'));

      await expect(storage.delByPattern('pattern*')).resolves.toBeUndefined();
      expect(logger.warn).toHaveBeenCalled();
    });

    it('get returns null when key does not exist', async () => {
      redisMock.get.mockResolvedValue(null);

      expect(await storage.get('missing')).toBeNull();
    });

    it('get returns null and logs warning when redis throws', async () => {
      redisMock.get.mockRejectedValue(new Error('redis error'));

      expect(await storage.get('key')).toBeNull();
      expect(logger.warn).toHaveBeenCalled();
    });

    it('set swallows redis error and logs warning', async () => {
      redisMock.set.mockRejectedValue(new Error('redis error'));

      await expect(storage.set('key', 'value')).resolves.toBeUndefined();
      expect(logger.warn).toHaveBeenCalled();
    });

    it('delByPattern skips del when keys array is empty', async () => {
      redisMock.keys.mockResolvedValue([]);

      await storage.delByPattern('empty:*');

      expect(redisMock.del).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    it('del calls redis.del with the key', async () => {
      await storage.del('my-key');

      expect(redisMock.del).toHaveBeenCalledWith('my-key');
    });

    it('delByPattern deletes all matched keys', async () => {
      redisMock.keys.mockResolvedValue(['key:1', 'key:2']);

      await storage.delByPattern('key:*');

      expect(redisMock.del).toHaveBeenCalledWith(['key:1', 'key:2']);
    });

    it('get parses and returns JSON value', async () => {
      redisMock.get.mockResolvedValue(JSON.stringify({ id: 1 }));

      const result = await storage.get<{ id: number }>('key');

      expect(result).toEqual({ id: 1 });
    });

    it('set stores JSON-serialized value without TTL', async () => {
      await storage.set('key', { foo: 'bar' });

      expect(redisMock.set).toHaveBeenCalledWith('key', JSON.stringify({ foo: 'bar' }));
    });

    it('set stores value with EX TTL when ttlSeconds provided', async () => {
      await storage.set('key', 'value', 60);

      expect(redisMock.set).toHaveBeenCalledWith('key', JSON.stringify('value'), 'EX', 60);
    });
  });
});
