import { PORT } from "./config/constants.js";
import { createApp } from "./core/app.js";

const app = createApp();

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
