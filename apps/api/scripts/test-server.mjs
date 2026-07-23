import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const tsxCli = require.resolve('tsx/cli');

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const hasExited = (child) => child.exitCode !== null || child.signalCode !== null;
const signalCleanup = new WeakMap();

const detachSignalCleanup = (child) => {
  const cleanup = signalCleanup.get(child);
  if (cleanup) cleanup();
  signalCleanup.delete(child);
};

const attachSignalCleanup = (child) => {
  const stopAndExit = (exitCode) => {
    detachSignalCleanup(child);
    void stopTestServer(child).finally(() => process.exit(exitCode));
  };
  const onSigint = () => stopAndExit(130);
  const onSigterm = () => stopAndExit(143);
  process.once('SIGINT', onSigint);
  process.once('SIGTERM', onSigterm);
  signalCleanup.set(child, () => {
    process.off('SIGINT', onSigint);
    process.off('SIGTERM', onSigterm);
  });
};

const assertPortAvailable = (port) =>
  new Promise((resolve, reject) => {
    const probe = createServer();
    probe.unref();
    probe.once('error', (error) => reject(new Error(`Test port ${port} is unavailable: ${error.message}`)));
    probe.listen({ host: '127.0.0.1', port, exclusive: true }, () => {
      probe.close((error) => (error ? reject(error) : resolve()));
    });
  });

const waitForExit = (child, timeoutMs) =>
  new Promise((resolve) => {
    if (hasExited(child)) {
      resolve(true);
      return;
    }

    const onExit = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      child.off('exit', onExit);
      resolve(false);
    }, timeoutMs);
    child.once('exit', onExit);
  });

export const testPort = (environmentName, fallback) => {
  const raw = process.env[environmentName] ?? process.env.API_TEST_PORT ?? `${fallback}`;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error(`${environmentName} must be an integer between 1024 and 65535`);
  }
  return port;
};

export const startTestServer = async (port) => {
  await assertPortAvailable(port);
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;
  const child = spawn(process.execPath, [tsxCli, 'src/index.ts'], {
    cwd: rootDir,
    env: { ...process.env, NODE_ENV: 'test', PORT: `${port}` },
    stdio: 'inherit',
    windowsHide: true,
  });

  let spawnError;
  child.once('error', (error) => {
    spawnError = error;
  });
  attachSignalCleanup(child);

  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (spawnError) {
      detachSignalCleanup(child);
      throw spawnError;
    }
    if (hasExited(child)) {
      detachSignalCleanup(child);
      throw new Error(`API server exited before becoming ready (${child.signalCode ?? `exit code ${child.exitCode}`})`);
    }

    try {
      const response = await fetch(`${baseUrl}/health/ready`, { signal: AbortSignal.timeout(1_000) });
      if (response.ok) return { baseUrl, child };
    } catch {
      // The server is still starting.
    }
    await wait(250);
  }

  await stopTestServer(child);
  throw new Error(`API server or database did not become ready at ${baseUrl}`);
};

export const stopTestServer = async (child) => {
  if (child) detachSignalCleanup(child);
  if (!child || hasExited(child)) return;

  child.kill('SIGTERM');
  if (await waitForExit(child, 3_000)) return;

  child.kill('SIGKILL');
  if (!(await waitForExit(child, 3_000))) {
    throw new Error(`Could not stop API test server process ${child.pid ?? 'unknown'}`);
  }
};
