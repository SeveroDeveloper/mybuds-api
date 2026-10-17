import { Module } from '@nestjs/common';
import { DatabaseHealth } from './database-health.js';
import { HealthController } from './health.controller.js';
import { PrismaDatabaseHealth } from './infrastructure/prisma-database-health.js';

@Module({
  controllers: [HealthController],
  // Wiring the port to its adapter: whoever asks for DatabaseHealth gets the Prisma version.
  providers: [{ provide: DatabaseHealth, useClass: PrismaDatabaseHealth }],
})
export class HealthModule {}
