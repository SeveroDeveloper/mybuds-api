import { INestApplication, VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

/**
 * App-wide HTTP settings, shared by main.ts and the e2e tests,
 * so tests run against exactly the same configuration as production.
 */
export function configureApp(app: INestApplication): void {
  // Route Nest's own logs (and every `new Logger(...)`) through pino, so they get the
  // same JSON format and the current request's ID.
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableShutdownHooks();
}
