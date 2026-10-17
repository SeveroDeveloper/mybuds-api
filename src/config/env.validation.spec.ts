import { validateEnv } from './env.validation.js';

const required = {
  DATABASE_URL: 'postgresql://user:pass@localhost/db?sslmode=verify-full',
};

describe('validateEnv', () => {
  it('applies defaults when optional values are missing', () => {
    const env = validateEnv({ ...required });
    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe('development');
  });

  it('converts PORT from string to number', () => {
    expect(validateEnv({ ...required, PORT: '8080' }).PORT).toBe(8080);
  });

  it('fails fast on an invalid value', () => {
    expect(() => validateEnv({ ...required, PORT: 'abc' })).toThrow(/PORT/);
    expect(() => validateEnv({ ...required, NODE_ENV: 'staging' })).toThrow(
      /NODE_ENV/,
    );
  });

  it('fails fast when DATABASE_URL is missing or not a postgres URL', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
    expect(() => validateEnv({ DATABASE_URL: 'mysql://x/db' })).toThrow(
      /DATABASE_URL/,
    );
  });

  // A real mistake: with `??`, pg ignores sslmode and connects without TLS.
  it.each([
    ['missing sslmode', 'postgresql://u:p@host/db'],
    ['mistyped query string', 'postgresql://u:p@host/db??sslmode=verify-full'],
  ])('fails fast when DATABASE_URL has %s', (_, url) => {
    expect(() => validateEnv({ DATABASE_URL: url })).toThrow(/sslmode/);
  });

  it('accepts sslmode anywhere in the query string', () => {
    const url =
      'postgresql://u:p@host/db?channel_binding=require&sslmode=disable';
    expect(validateEnv({ DATABASE_URL: url }).DATABASE_URL).toBe(url);
  });
});
