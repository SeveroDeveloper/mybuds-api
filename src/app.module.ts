import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { type Env, validateEnv } from './config/env.validation.js';
import { HealthModule } from './health/health.module.js';
import { loggerParams } from './shared/infrastructure/logging/logger.params.js';
import { PrismaModule } from './shared/infrastructure/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      // Tests read .env.test (Neon "test" branch) so they never touch dev data.
      // Real environment variables always win over the file (CI, Render).
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        loggerParams({
          LOG_LEVEL: config.get('LOG_LEVEL', { infer: true }),
          NODE_ENV: config.get('NODE_ENV', { infer: true }),
        }),
    }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
