import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// The Prisma CLI does not read .env on its own. Load it when it exists (local dev);
// in CI and Docker the variables come from the environment instead.
if (existsSync('.env')) process.loadEnvFile();

/**
 * Configuration for the Prisma CLI (generate, migrate). The running app does not use it.
 * Migrations use the DIRECT (non-pooled) URL: they need one long-lived session,
 * which a connection pooler can't guarantee.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    // Not env('DIRECT_URL'): that throws when unset, and `prisma generate`
    // (e.g. in the Docker build) must work without any database URL.
    url: process.env['DIRECT_URL'],
  },
});
