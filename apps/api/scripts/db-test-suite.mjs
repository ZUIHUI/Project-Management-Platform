import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { validateTestDatabase } from './database-test-guard.mjs';

const apiDir = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const prismaCli = require.resolve('prisma');
const tsxCli = require.resolve('tsx/cli');

const { parsedUrl, databaseName } = validateTestDatabase(process.env.DATABASE_URL);

const run = (label, args, extraEnv = {}) =>
  new Promise((resolve, reject) => {
    console.log(`\n==> ${label}`);
    const child = spawn(process.execPath, args, {
      cwd: apiDir,
      env: { ...process.env, NODE_ENV: 'test', ...extraEnv },
      stdio: 'inherit',
      windowsHide: true,
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} failed (${signal ? `signal ${signal}` : `exit code ${code}`})`));
    });
  });

console.log(`Running isolated database tests against ${parsedUrl.hostname}/${databaseName}`);
await run('Generate Prisma client', [prismaCli, 'generate']);
await run('Apply database migrations', [prismaCli, 'migrate', 'deploy']);
await run('Seed test fixtures', [tsxCli, 'seed.ts']);
await run('Contract runtime tests', ['scripts/contract.mjs'], { CONTRACT_TEST_PORT: '3101' });
await run('Authorization integration tests', ['scripts/integration.mjs'], { INTEGRATION_TEST_PORT: '3102' });
await run('End-to-end smoke tests', ['scripts/smoke.mjs'], { SMOKE_TEST_PORT: '3103' });
console.log('\nDatabase test suite passed');
