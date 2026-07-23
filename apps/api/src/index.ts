import { env } from './config/env.js';
import { createApp } from './core/app.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`API server listening on port ${env.port}`);
});
