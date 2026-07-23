import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV ?? 'development';

const secret = (name: 'JWT_SECRET' | 'JWT_REFRESH_SECRET', developmentFallback: string) => {
  const value = process.env[name];
  if (value) return value;
  if (nodeEnv === 'production') {
    throw new Error(`${name} is required in production`);
  }
  return developmentFallback;
};

export const env = Object.freeze({
  nodeEnv,
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: secret('JWT_SECRET', 'development-only-access-secret'),
  jwtRefreshSecret: secret('JWT_REFRESH_SECRET', 'development-only-refresh-secret'),
});
