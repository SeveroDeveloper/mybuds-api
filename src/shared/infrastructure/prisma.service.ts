import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import type { Env } from '../../config/env.validation.js';

/**
 * The single Prisma client of the app. Only `infrastructure/` code may inject it.
 * Uses the pooled DATABASE_URL through the `pg` driver adapter.
 *
 * Connections are lazy: the pg pool opens one on the first query, so the app boots
 * even if the database is briefly unreachable (e.g. Neon waking from scale-to-zero).
 * /api/v1/health is what reports a database that is down.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService<Env, true>) {
    super({
      adapter: new PrismaPg({
        connectionString: config.get('DATABASE_URL', { infer: true }),
        // pg waits forever for a connection by default; a black-holed network
        // would hang every request (and the health check). 5s covers a Neon cold start.
        connectionTimeoutMillis: 5_000,
      }),
    });
  }

  /** Closes the pool on shutdown (enableShutdownHooks) so no connection is left open. */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
