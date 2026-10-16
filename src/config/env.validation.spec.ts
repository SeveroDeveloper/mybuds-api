import { validateEnv } from './env.validation.js';

describe('validateEnv', () => {
  it('applies defaults when optional values are missing', () => {
    const env = validateEnv({});
    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe('development');
  });

  it('converts PORT from string to number', () => {
    expect(validateEnv({ PORT: '8080' }).PORT).toBe(8080);
  });

  it('fails fast on an invalid value', () => {
    expect(() => validateEnv({ PORT: 'abc' })).toThrow(/PORT/);
    expect(() => validateEnv({ NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });
});
