import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { DatabaseHealth } from './database-health.js';

interface HealthResponse {
  api: 'ok';
  db: 'ok' | 'down';
}

/**
 * Readiness check used by the deploy pipeline and by Koyeb.
 * 200 when the database answers, 503 when it doesn't, so the platform
 * stops sending traffic to an instance that can't serve requests.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseHealth) {}

  @Get()
  async check(
    // passthrough: we only set the status code; Nest still serializes the return value.
    @Res({ passthrough: true }) res: Response,
  ): Promise<HealthResponse> {
    const dbUp = await this.database.isUp();
    if (!dbUp) res.status(HttpStatus.SERVICE_UNAVAILABLE);
    return { api: 'ok', db: dbUp ? 'ok' : 'down' };
  }
}
