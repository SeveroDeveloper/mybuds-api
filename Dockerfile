# syntax=docker/dockerfile:1
# Production image for mybuds-api. Built and smoke-tested in CI (no Docker locally).
# Two stages: "build" has the full toolchain; "runtime" ships only what runs.

# ---------- build stage: compile TypeScript ----------
FROM node:24-slim AS build
WORKDIR /app

# Dependency manifests first: this layer is cached until they change,
# so editing source code doesn't reinstall every package.
COPY package.json package-lock.json ./
# npm ci = exact versions from the lockfile. --ignore-scripts skips our postinstall,
# which needs the schema (not copied yet). The cache mount reuses downloads between builds.
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts

# Generate the Prisma client as its own step, so a schema change doesn't reinstall
# every package. No database URL needed.
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm run db:generate

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---------- runtime stage: what actually runs in production ----------
FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Production dependencies only (375 MB → 129 MB):
# --omit=optional: @prisma/client lists the Prisma CLI and TypeScript as *optional peers*,
#   so npm keeps them under --omit=dev alone. Nothing optional is needed at runtime.
# --ignore-scripts: our postinstall needs the Prisma CLI; the client is already in dist/.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --omit=optional --ignore-scripts

COPY --from=build /app/dist ./dist

# Run as the unprivileged "node" user that ships with the image, not root.
USER node
EXPOSE 3000
# Exec form: node is PID 1 and receives SIGTERM directly, so Nest's shutdown hooks
# close the DB pool when the platform stops the container.
CMD ["node", "dist/main.js"]
