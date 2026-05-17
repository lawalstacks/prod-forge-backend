import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { LoggerService } from '../../../logger/logger.service';
import { RedisManagerService } from '../redis-manager.service';

@Injectable()
export class CacheStorage {
  private readonly redis: Redis;

  constructor(
    private readonly redisManager: RedisManagerService,
    private readonly loggerService: LoggerService,
  ) {
    this.redis = this.redisManager.getCacheRedis();
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch {
      this.loggerService.warn({ ctx: CacheStorage.name, msg: `Cache del failed for key "${key}"` });
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length) {
        await this.redis.del(keys);
      }
    } catch {
      this.loggerService.warn({ ctx: CacheStorage.name, msg: `Cache delByPattern failed for pattern "${pattern}"` });
    }
  }

  async get<T>(key: string): Promise<null | T> {
    try {
      const data = await this.redis.get(key);

      return data ? (JSON.parse(data) as T) : null;
    } catch {
      this.loggerService.warn({ ctx: CacheStorage.name, msg: `Cache get failed for key "${key}"` });
    }

    return null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);

      if (ttlSeconds) {
        await this.redis.set(key, data, 'EX', ttlSeconds);
      } else {
        await this.redis.set(key, data);
      }
    } catch {
      this.loggerService.warn({ ctx: CacheStorage.name, msg: `Cache set failed for key "${key}"` });
    }
  }
}
