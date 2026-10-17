import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma.service.js';
import { DatabaseHealth } from '../database-health.js';

/** Adapter: checks the database with the cheapest possible round trip, `SELECT 1`. */
@Injectable()
export class PrismaDatabaseHealth implements DatabaseHealth {
  private readonly logger = new Logger(PrismaDatabaseHealth.name);

  constructor(private readonly prisma: PrismaService) {}

  async isUp(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      // pg error messages name the host/user at most, never the password.
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Database health check failed: ${reason}`);
      return false;
    }
  }
}
