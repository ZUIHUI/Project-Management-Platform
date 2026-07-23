import assert from 'node:assert/strict';
import { validateTestDatabase } from './database-test-guard.mjs';

assert.throws(() => validateTestDatabase(undefined, 'test'), /DATABASE_URL is required/);
assert.throws(
  () => validateTestDatabase('postgresql://localhost/project_test', 'PRODUCTION'),
  /NODE_ENV=production/,
);
assert.throws(() => validateTestDatabase('not a URL', 'test'), /valid URL/);
assert.throws(
  () => validateTestDatabase('file:./project_test.db', 'test'),
  /only supports PostgreSQL/,
);
assert.throws(
  () => validateTestDatabase('postgresql://localhost/project_management', 'test'),
  /standalone "test" marker/,
);
assert.throws(
  () => validateTestDatabase('postgresql://localhost/contest', 'test'),
  /standalone "test" marker/,
);

const safe = validateTestDatabase(
  'postgresql://postgres:secret@127.0.0.1:5432/project_management_test?schema=public',
  'test',
);
assert.equal(safe.databaseName, 'project_management_test');
assert.equal(safe.parsedUrl.hostname, '127.0.0.1');

console.log('Database test guard passed');
