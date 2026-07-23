import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = fileURLToPath(new URL('../', import.meta.url));
const sourceRoot = join(apiRoot, 'src');

const filesUnder = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(path) : [path];
    }),
  );
  return nested.flat().filter((path) => ['.ts', '.js'].includes(extname(path)) && !path.endsWith('.d.ts'));
};

const assertNoImports = async (directory, forbidden, label) => {
  const violations = [];
  for (const file of await filesUnder(directory)) {
    const source = await readFile(file, 'utf8');
    for (const pattern of forbidden) {
      if (pattern.test(source)) violations.push(`${relative(apiRoot, file)} matches ${pattern}`);
    }
  }
  assert.deepEqual(violations, [], `${label} boundary violations:\n${violations.join('\n')}`);
};

await assertNoImports(
  join(sourceRoot, 'domain'),
  [/from ['"].*application\//, /from ['"].*infrastructure\//, /from ['"]express['"]/, /from ['"]@prisma/],
  'domain',
);
await assertNoImports(
  join(sourceRoot, 'application'),
  [/from ['"].*interfaces\//, /from ['"]express['"]/, /import\s+(?!type\b).*from ['"]@prisma\/client['"]/],
  'application',
);
await assertNoImports(
  join(sourceRoot, 'infrastructure'),
  [/from ['"].*application\//, /from ['"].*interfaces\//],
  'infrastructure',
);
await assertNoImports(
  join(sourceRoot, 'interfaces/http/routes'),
  [/from ['"].*infrastructure\//],
  'HTTP route',
);

const JavaScriptSources = (await filesUnder(sourceRoot)).filter((path) => extname(path) === '.js');
assert.deepEqual(
  JavaScriptSources,
  [],
  `Backend source must stay TypeScript-only:\n${JavaScriptSources.map((path) => relative(apiRoot, path)).join('\n')}`,
);

console.log('Architecture gate passed');
