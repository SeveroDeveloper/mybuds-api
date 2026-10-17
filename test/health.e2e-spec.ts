import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import type { Env } from '../src/config/env.validation.js';
import { PrismaService } from '../src/shared/infrastructure/prisma.service.js';

async function bootApp(
  customize: (builder: TestingModuleBuilder) => TestingModuleBuilder = (b) => b,
): Promise<INestApplication<App>> {
  const moduleRef = await customize(
    Test.createTestingModule({ imports: [AppModule] }),
  ).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>({
    logger: false,
  });
  configureApp(app);
  return app.init();
}

describe('Health (e2e)', () => {
  describe('with the database reachable (Neon test branch)', () => {
    let app: INestApplication<App>;
    beforeAll(async () => (app = await bootApp()));
    afterAll(() => app.close());

    it('GET /api/v1/health returns 200 with api and db ok', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect({ api: 'ok', db: 'ok' });
    });

    it('unversioned routes do not exist', () => {
      return request(app.getHttpServer()).get('/health').expect(404);
    });
  });

  describe('with the database unreachable', () => {
    let app: INestApplication<App>;
    beforeAll(async () => {
      // A real Prisma client pointed at a port where nothing listens:
      // exercises the real failure path, not a fake that returns false.
      const unreachable = new PrismaService({
        get: () => 'postgresql://user:pass@127.0.0.1:1/none',
      } as unknown as ConfigService<Env, true>);
      app = await bootApp((b) =>
        b.overrideProvider(PrismaService).useValue(unreachable),
      );
    });
    afterAll(() => app.close());

    it('GET /api/v1/health returns 503 with db down (not a 500)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(503)
        .expect({ api: 'ok', db: 'down' });
    });
  });
});
