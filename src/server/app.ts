import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import type { ToolResponseType } from "muppet";
import { logger } from "../logger.js";

export const app = new Hono();

app.onError((err, c) => {
	logger.error(err);

	return c.json<ToolResponseType>(
		{
			// @ts-expect-error: muppet types are not updated
			isError: true,
			content: [
				{
					type: "text",
					text: `Error: ${err.message}`,
				},
			],
		},
		500,
	);
});

app.notFound((c) => {
	return c.json({ error: "Not Found" }, 404);
});

app.use(honoLogger((message, ...rest) => logger.info(message, ...rest)));
