import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const rootDir = fileURLToPath(new URL('../', import.meta.url));

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete']);
const toExpressLike = (openapiPath) => openapiPath.replaceAll('{', ':').replaceAll('}', '');
const operationKey = (method, path) => `${method.toUpperCase()} ${path}`;

const loadSpecOperations = async () => {
  const content = await readFile(join(rootDir, 'openapi/openapi.yaml'), 'utf8');
  const operations = [];
  let currentPath = null;

  for (const line of content.split(/\r?\n/)) {
    const pathMatch = line.match(/^\s{2}(\/[^:]+):\s*$/);
    if (pathMatch) {
      currentPath = toExpressLike(pathMatch[1].trim());
      continue;
    }

    const methodMatch = line.match(/^\s{4}([a-z]+):\s*$/);
    if (currentPath && methodMatch && HTTP_METHODS.has(methodMatch[1])) {
      operations.push(operationKey(methodMatch[1], currentPath));
    }
  }

  return operations;
};

const loadRuntimeOperations = async () => {
  const files = [
    'src/interfaces/http/routes/auth.routes.ts',
    'src/interfaces/http/routes/project.routes.ts',
    'src/interfaces/http/routes/issue.routes.ts',
    'src/interfaces/http/routes/dashboard.routes.ts',
    'src/interfaces/http/routes/notification.routes.ts',
    'src/interfaces/http/routes/health.routes.ts',
    'src/interfaces/http/routes/openapi.routes.ts',
  ];

  const operationSet = new Set();
  for (const file of files) {
    const content = await readFile(join(rootDir, file), 'utf8');
    const matches = content.matchAll(/\b\w*router\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/gi);
    for (const match of matches) {
      operationSet.add(operationKey(match[1], match[2]));
    }
  }
  return [...operationSet];
};

const run = async () => {
  const [specOperations, runtimeOperations] = await Promise.all([loadSpecOperations(), loadRuntimeOperations()]);
  const missingInRuntime = specOperations.filter((operation) => !runtimeOperations.includes(operation));
  const missingInSpec = runtimeOperations.filter((operation) => !specOperations.includes(operation));

  assert.deepEqual(missingInRuntime, [], `Runtime is missing OpenAPI operations:\n${missingInRuntime.map((x) => ` - ${x}`).join('\n')}`);
  assert.deepEqual(missingInSpec, [], `OpenAPI is missing runtime operations:\n${missingInSpec.map((x) => ` - ${x}`).join('\n')}`);

  console.log(`Contract gate passed (${specOperations.length} operations mapped bidirectionally)`);
};

run().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
