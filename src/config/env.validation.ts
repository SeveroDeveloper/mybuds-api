import { plainToInstance, Type } from 'class-transformer';
import { IsIn, IsInt, Max, Min, validateSync } from 'class-validator';

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
