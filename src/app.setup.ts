import { INestApplication, VersioningType } from '@nestjs/common';

/**
 * App-wide HTTP settings, shared by main.ts and the e2e tests,
 * so tests run against exactly the same configuration as production.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableShutdownHooks();
}
