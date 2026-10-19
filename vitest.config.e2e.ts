import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    // Nest loads reflect-metadata at runtime; plain unit tests need it too.
    setupFiles: ['reflect-metadata'],
    // Makes AppModule load .env.test (the Neon "test" branch), never .env (dev).
    // LOG_LEVEL=silent keeps test output readable; logging.e2e-spec.ts captures logs itself.
    env: { NODE_ENV: 'test', LOG_LEVEL: 'silent' },
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});
