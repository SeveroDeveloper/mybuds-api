# mybuds-api

Backend for **mybuds**, a personal-finance app that divides each month's income across debts, bills, savings goals and investments, for individuals and couples.

**Stack:** TypeScript · NestJS 12 (Express) · PostgreSQL 18 + Prisma · Vitest · Docker · GitHub Actions · Koyeb.
**Architecture:** modular monolith, DDD + hexagonal (ports & adapters), SOLID.

## Run locally

Requires Node 24 (`fnm use` reads `.nvmrc`).

```bash
npm ci
cp .env.example .env   # then fill in the Neon "dev" branch URLs
npm run start:dev      # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run start:dev` | Run with hot reload |
| `npm run build` | Compile to `dist/` |
| `npm run lint` | oxlint |
| `npm run typecheck` | TypeScript without emitting |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | API end-to-end tests |

## License

All rights reserved. See [LICENSE](LICENSE).
