import { Controller, Get } from '@nestjs/common';

export interface HealthResponse {
  status: 'ok';
}

/**
 * Liveness check used by the deploy pipeline and by Koyeb to know the app is up.
 * A database check is added once Prisma is wired in.
 */
@Controller('health')
export class HealthController {
  @Get()
  check(): HealthResponse {
    return { status: 'ok' };
  }
}
