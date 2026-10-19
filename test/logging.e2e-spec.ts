import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PARAMS_PROVIDER_TOKEN } from 'nestjs-pino';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { loggerParams } from '../src/shared/infrastructure/logging/logger.params.js';

const UUID = /^[0-9a-f-]{36}$/;

describe('Logging (e2e)', () => {
  let app: INestApplication<App>;
  const lines: string[] = [];
  // pino accepts any object with write(): the real log lines land here instead of stdout.
  const memory = { write: (line: string) => void lines.push(line) };
  const logs = () => lines.map((l) => JSON.parse(l) as Record<string, any>);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PARAMS_PROVIDER_TOKEN)
      .useValue(loggerParams({ LOG_LEVEL: 'info', NODE_ENV: 'test' }, memory))
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterAll(() => app.close());
  beforeEach(() => (lines.length = 0));

  // Let the "request completed" line (written when the response finishes) land.
  const settle = () => new Promise((resolve) => setImmediate(resolve));

  it('ties each request to an ID in the response header and the log line, without secrets or personal data', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/does-not-exist?email=ana@example.com')
      .set('Authorization', 'Bearer super-secret-token')
      .set('Cookie', 'session=secret-session-id')
      .set('X-Forwarded-For', '203.0.113.7')
      .expect(404);
    await settle();

    const id = res.headers['x-request-id'];
    expect(id).toMatch(UUID);
    const line = logs().find((l) => l.req?.id === id);
    // Exactly these fields: no headers, no IP, no query string.
    expect(line?.req).toEqual({
      id,
      method: 'GET',
      url: '/api/v1/does-not-exist',
    });
    expect(line?.res).toEqual({ statusCode: 404 });
    expect(lines.join('')).not.toMatch(
      /super-secret-token|secret-session-id|203\.0\.113\.7|ana@example\.com/,
    );
  });

  it('reuses a safe incoming request ID and replaces an unsafe one', async () => {
    const server = app.getHttpServer();
    const reused = await request(server)
      .get('/api/v1/does-not-exist')
      .set('x-request-id', 'edge-abc-123');
    expect(reused.headers['x-request-id']).toBe('edge-abc-123');

    const forged = await request(server)
      .get('/api/v1/does-not-exist')
      .set('x-request-id', 'fake id" "level":60');
    expect(forged.headers['x-request-id']).toMatch(UUID);
  });

  it('does not log health checks (the platform calls them every few seconds)', async () => {
    await request(app.getHttpServer()).get('/api/v1/health');
    await settle();
    expect(logs().filter((l) => l.req?.url === '/api/v1/health')).toEqual([]);
  });
});
