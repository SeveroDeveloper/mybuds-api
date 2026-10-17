import { plainToInstance, Type } from 'class-transformer';
import { IsIn, IsInt, Matches, Max, Min, validateSync } from 'class-validator';

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

  /**
   * Pooled Postgres URL used by the running app. Required, no default.
   * (DIRECT_URL is only read by the Prisma CLI for migrations, so the app doesn't ask for it.)
   */
  @Matches(/^postgres(ql)?:\/\/.+/, {
    message: 'DATABASE_URL must be a postgres:// or postgresql:// URL',
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
