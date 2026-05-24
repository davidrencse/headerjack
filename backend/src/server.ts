import { createApp } from "./app.js";
import { seed } from "./seed.js";

const port = Number(process.env.PORT ?? 3001);

await seed();

const app = createApp();
app.listen(port, () => {
  console.log(JSON.stringify({ level: "info", service: "headerjack-api", event: "server.listen", port }));
});
