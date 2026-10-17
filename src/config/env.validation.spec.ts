import { validateEnv } from './env.validation.js';

const required = { DATABASE_URL: 'postgresql://user:pass@localhost/db' };

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
});
