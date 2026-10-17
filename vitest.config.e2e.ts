import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    // Nest loads reflect-metadata at runtime; plain unit tests need it too.
    setupFiles: ['reflect-metadata'],
    // Makes AppModule load .env.test (the Neon "test" branch), never .env (dev).
    env: { NODE_ENV: 'test' },
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});
