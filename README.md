# mybuds-api

Backend for **mybuds**, a personal-finance app that divides each month's income across debts, bills, savings goals and investments, for individuals and couples.

**Stack:** TypeScript · NestJS 12 (Express) · PostgreSQL 18 + Prisma · Vitest · Docker · GitHub Actions · Koyeb.
**Architecture:** modular monolith, DDD + hexagonal (ports & adapters), SOLID.

## Run locally

Requires Node 24 (`fnm use` reads `.nvmrc`).

```bash
npm ci                 # also generates the Prisma client (postinstall)
cp .env.example .env   # then fill in the Neon "dev" branch URLs
npm run start:dev      # http://localhost:3000
```

For `npm run test:e2e`, also create `.env.test` with the same keys pointing to the Neon **test** branch. Tests never read `.env`.

## Scripts

| Command | What it does |
|---|---|
| `npm run start:dev` | Run with hot reload |
| `npm run build` | Compile to `dist/` |
| `npm run lint` | oxlint |
| `npm run typecheck` | TypeScript without emitting |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | API end-to-end tests (Neon `test` branch, via `.env.test`) |
| `npm run db:generate` | Regenerate the Prisma client after editing `prisma/schema.prisma` |

## Docker

`Dockerfile` builds the production image (multi-stage, non-root, `node dist/main.js` on port 3000). It is built and smoke-tested in CI; there is no local Docker workflow. Configure it with environment variables (`DATABASE_URL`, `PORT`), never with files baked into the image.

## License

All rights reserved. See [LICENSE](LICENSE).
