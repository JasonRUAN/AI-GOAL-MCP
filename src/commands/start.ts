import { command, string } from "@drizzle-team/brocli";
import { logger } from "../logger.js";
import { startServer } from "../server/index.js";

export const start = command({
	name: "start",
	desc: "Start the SuiMCP server on stdio",
	options: {
		loglevel: string()
			.enum("info", "debug", "warn", "error")
			.desc("The log level you want to use")
			.default("info"),
	},
	handler: ({ loglevel }) => {
		logger.level = loglevel;
		startServer();
	},
});
