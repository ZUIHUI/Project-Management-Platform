import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const rootDir = fileURLToPath(new URL('../', import.meta.url));

const toExpressLike = (openapiPath) => openapiPath.replaceAll('{', ':').replaceAll('}', '');

const loadSpecPaths = async () => {
  const content = await readFile(join(rootDir, 'openapi/openapi.yaml'), 'utf8');
  return [...content.matchAll(/^\s{2}(\/[^:]+):\s*$/gm)].map((m) => toExpressLike(m[1].trim()));
};

const loadRuntimePaths = async () => {
  const files = [
    'src/domain/auth/auth.routes.js',
    'src/domain/project/project.routes.js',
    'src/domain/issue/issue.routes.js',
    'src/domain/dashboard/dashboard.routes.js',
    'src/domain/notification/notification.routes.js',
    'src/domain/health/health.routes.js',
    'src/domain/health/openapi.routes.js',
  ];

  const pathSet = new Set();
  for (const file of files) {
    const content = await readFile(join(rootDir, file), 'utf8');
    const matches = content.matchAll(/router\.(?:get|post|put|patch|delete)\(['"]([^'"]+)['"]/g);
    for (const match of matches) {
      pathSet.add(match[1]);
    }
  }
  return [...pathSet];
};

const run = async () => {
  const [specPaths, runtimePaths] = await Promise.all([loadSpecPaths(), loadRuntimePaths()]);
  const missingInRuntime = specPaths.filter((path) => !runtimePaths.includes(path));

  assert.deepEqual(
    missingInRuntime,
    [],
    `OpenAPI contract gate failed. Runtime is missing OpenAPI paths:\n${missingInRuntime.map((x) => ` - ${x}`).join('\n')}`,
  );

  console.log(`Contract gate passed (${specPaths.length} OpenAPI paths mapped to runtime)`);
};

run().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
