import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { Env } from '../config/env.validation.js';
import { DatabaseHealth } from './database-health.js';

interface HealthResponse {
  api: 'ok';
  db: 'ok' | 'down';
  /** Commit SHA of the running image: lets the deploy pipeline see when the new version is live. */
  version: string;
}

/**
 * Readiness check used by the deploy pipeline and by Render.
 * 200 when the database answers, 503 when it doesn't, so the platform
 * stops sending traffic to an instance that can't serve requests.
 */
@Controller('health')
export class HealthController {
  private readonly version: string;

  constructor(
    private readonly database: DatabaseHealth,
    config: ConfigService<Env, true>,
  ) {
    this.version = config.get('APP_VERSION', { infer: true });
  }

  @Get()
  async check(
    // passthrough: we only set the status code; Nest still serializes the return value.
    @Res({ passthrough: true }) res: Response,
  ): Promise<HealthResponse> {
    const dbUp = await this.database.isUp();
    if (!dbUp) res.status(HttpStatus.SERVICE_UNAVAILABLE);
    return { api: 'ok', db: dbUp ? 'ok' : 'down', version: this.version };
  }
}
