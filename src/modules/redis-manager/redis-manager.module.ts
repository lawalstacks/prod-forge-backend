import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Module } from '@nestjs/common';

import { EnvironmentModule } from '../environment/environment.module';
import { CacheRedis } from './clients/cache.client';
import { ThrottlerRedis } from './clients/throttler.client';
import { REDIS_CACHE, REDIS_THROTTLER, THROTTLER_REDIS_STORAGE } from './di/di.types';
import { RedisOptionsInterface } from './interfaces/redis-options.interface';
import { RedisHealthService } from './redis-health.service';
import { RedisManagerService } from './redis-manager.service';
import { CacheStorage } from './storages/cache.storage';
import { ThrottlerStorage } from './storages/throttler.storage';

@Module({
  exports: [RedisManagerService, RedisHealthService, CacheStorage, ThrottlerStorage],
  imports: [EnvironmentModule],
  providers: [
    {
      provide: REDIS_THROTTLER,
      useFactory: (): RedisOptionsInterface => ({
        db: 0,
        keyPrefix: 'throttler:',
      }),
    },
    {
      provide: REDIS_CACHE,
      useFactory: (): RedisOptionsInterface => ({
        db: 1,
        keyPrefix: 'cache:',
      }),
    },
    {
      inject: [ThrottlerRedis],
      provide: THROTTLER_REDIS_STORAGE,
      useFactory: (throttlerRedis: ThrottlerRedis): ThrottlerStorageRedisService =>
        new ThrottlerStorageRedisService(throttlerRedis.getClient()),
    },
    RedisManagerService,
    ThrottlerRedis,
    CacheRedis,
    RedisHealthService,
    CacheStorage,
    ThrottlerStorage,
  ],
})
export class RedisManagerModule {}
