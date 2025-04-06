import path from "node:path";
import { boolean, command, run, string } from "@drizzle-team/brocli";
import { getLogger, initLogger } from "./logger.js";
import { startServer } from "./server/index.js";
import { getPackageVersion } from "./utils/version.js";

const start = command({
	name: "start",
	options: {},
	handler: (_opts) => {
		startServer();
	},
});

run([start], {
	name: "sui-mcp",
	description: "SuiMCP CLI",
	omitKeysOfUndefinedOptions: true,
	version: await getPackageVersion(),
	globals: {
		clear: boolean().alias("c").desc("Clear the log file").default(false),

		logfile: string()
			.desc("The file you want to log to")
			.alias("f")
			.default(path.join(import.meta.dirname, "./sui-mcp.log")),

		loglevel: string()
			.enum("info", "debug", "warn", "error")
			.desc("The log level you want to use")
			.default("info"),
	},
	hook: (event, command, globals) => {
		if (event === "before") {
			initLogger({
				logfile: globals.logfile,
				loglevel: globals.loglevel,
				clear: globals.clear,
			});

			getLogger().debug(`Running command: ${JSON.stringify(command, null, 2)}`);
		} else if (event === "after") {
			getLogger().debug(
				`Command finished: ${JSON.stringify(command, null, 2)}`,
			);
		}
	},
});
