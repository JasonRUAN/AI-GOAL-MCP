import { run } from "@drizzle-team/brocli";
import { commands } from "./commands/index.js";
import { logger } from "./logger.js";
import { getPackageVersion } from "./utils/version.js";

run(commands, {
	name: "sui-mcp",
	description: "SuiMCP CLI",
	omitKeysOfUndefinedOptions: true,
	version: await getPackageVersion(),
	hook: (event, command) => {
		logger.debug(`Command Hook: ${event}`, command);
	},
});
