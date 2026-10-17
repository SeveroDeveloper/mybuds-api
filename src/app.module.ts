import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation.js';
import { HealthController } from './health/health.controller.js';
import { PrismaModule } from './shared/infrastructure/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      // Tests read .env.test (Neon "test" branch) so they never touch dev data.
      // Real environment variables always win over the file (CI, Koyeb).
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    PrismaModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
