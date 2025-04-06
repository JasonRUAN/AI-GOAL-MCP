import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import { getLogger } from "../logger.js";

export const app = new Hono();

app.onError((err, c) => {
  getLogger().error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

app.use(honoLogger((message, ...rest) => getLogger().info(message, ...rest)));
