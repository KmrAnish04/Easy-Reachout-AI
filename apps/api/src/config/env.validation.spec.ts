import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('should pass validation with all required variables', () => {
    const validConfig = {
      NODE_ENV: 'development',
      PORT: '3001',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/easyreachout',
      JWT_SECRET: 'a-very-secure-secret-key-with-at-least-32-characters',
    };

    const result = validateEnv(validConfig);

    expect(result).toEqual(validConfig);
  });

  it('should default NODE_ENV to development when not provided', () => {
    const config = {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/easyreachout',
      JWT_SECRET: 'a-very-secure-secret-key-with-at-least-32-characters',
    };

    const result = validateEnv(config);

    expect(result.NODE_ENV).toBe('development');
  });

  it('should default PORT to 3001 when not provided', () => {
    const config = {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/easyreachout',
      JWT_SECRET: 'a-very-secure-secret-key-with-at-least-32-characters',
    };

    const result = validateEnv(config);

    expect(result.PORT).toBe('3001');
  });

  it('should fail when DATABASE_URL is missing', () => {
    const invalidConfig = {
      NODE_ENV: 'development',
      JWT_SECRET: 'a-very-secure-secret-key-with-at-least-32-characters',
    };

    expect(() => validateEnv(invalidConfig)).toThrow(
      '❌ Environment validation failed:\nDATABASE_URL: Required',
    );
  });

  it('should fail when JWT_SECRET is too short', () => {
    const invalidConfig = {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/easyreachout',
      JWT_SECRET: 'short',
    };

    expect(() => validateEnv(invalidConfig)).toThrow(
      '❌ Environment validation failed:\nJWT_SECRET: String must contain at least 32 character(s)',
    );
  });

  it('should fail with multiple validation errors', () => {
    const invalidConfig = {
      JWT_SECRET: 'short',
    };

    expect(() => validateEnv(invalidConfig)).toThrow(
      '❌ Environment validation failed:',
    );
    expect(() => validateEnv(invalidConfig)).toThrow('DATABASE_URL: Required');
    expect(() => validateEnv(invalidConfig)).toThrow(
      'JWT_SECRET: String must contain at least 32 character(s)',
    );
  });

  it('should accept production and test NODE_ENV values', () => {
    const configProduction = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/easyreachout',
      JWT_SECRET: 'a-very-secure-secret-key-with-at-least-32-characters',
    };

    const configTest = {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/easyreachout',
      JWT_SECRET: 'a-very-secure-secret-key-with-at-least-32-characters',
    };

    expect(() => validateEnv(configProduction)).not.toThrow();
    expect(() => validateEnv(configTest)).not.toThrow();
  });

  it('should reject invalid NODE_ENV values', () => {
    const invalidConfig = {
      NODE_ENV: 'staging',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/easyreachout',
      JWT_SECRET: 'a-very-secure-secret-key-with-at-least-32-characters',
    };

    expect(() => validateEnv(invalidConfig)).toThrow(
      '❌ Environment validation failed:',
    );
  });
});
