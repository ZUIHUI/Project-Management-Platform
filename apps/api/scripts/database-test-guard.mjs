export const validateTestDatabase = (databaseUrl, nodeEnv = process.env.NODE_ENV) => {
  if (!databaseUrl) throw new Error('DATABASE_URL is required for the database test suite');
  if (`${nodeEnv ?? ''}`.toLowerCase() === 'production') {
    throw new Error('Database test suite refuses to run with NODE_ENV=production');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid URL');
  }

  if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol)) {
    throw new Error('Database test suite only supports PostgreSQL test databases');
  }

  const databaseName = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, '')).split('/')[0];
  if (!/(^|[_-])test($|[_-])/i.test(databaseName)) {
    throw new Error(`Refusing to use database "${databaseName || '(missing)'}": its name must contain a standalone "test" marker`);
  }

  return { parsedUrl, databaseName };
};
