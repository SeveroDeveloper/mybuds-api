import { plainToInstance, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsString,
  Matches,
  Max,
  Min,
  validateSync,
} from 'class-validator';

/**
 * Every environment variable the app reads, with its rules.
 * Validated once at boot: a missing or invalid value stops the app immediately
 * (fail fast) instead of causing a confusing error later.
 */
export class Env {
  @IsIn(['development', 'test', 'production'])
  NODE_ENV: 'development' | 'test' | 'production' = 'development';

  @Type(() => Number) // explicit conversion: env vars always arrive as strings
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  /** Commit SHA baked into the Docker image (build arg); "dev" when running from source. */
  @IsString()
  APP_VERSION: string = 'dev';

  /**
   * Pooled Postgres URL used by the running app. Required, no default.
   * (DIRECT_URL is only read by the Prisma CLI for migrations, so the app doesn't ask for it.)
   *
   * sslmode must be explicit: if it's missing or mistyped (e.g. `??sslmode=`), pg silently
   * connects WITHOUT TLS. Neon refuses that, but other servers would accept plaintext.
   * (Use sslmode=disable only for a local/CI Postgres.)
   */
  @Matches(/^postgres(ql)?:\/\/[^?]+\?(.*&)?sslmode=[a-z-]+(&|$)/, {
    message:
      'DATABASE_URL must be a postgres:// or postgresql:// URL with an explicit sslmode parameter',
  })
  DATABASE_URL: string;
}

export function validateEnv(raw: Record<string, unknown>): Env {
  const env = plainToInstance(Env, raw);
  const errors = validateSync(env, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map(
        (e) =>
          `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`,
      )
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return env;
}
