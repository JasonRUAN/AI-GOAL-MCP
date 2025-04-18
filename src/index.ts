import { run } from "@drizzle-team/brocli";
import { commands } from "./commands/index.js";
import { logger } from "./logger.js";
import { getPackageVersion } from "./utils/version.js";

run(commands, {
	name: "sui-mcp",
	description: "SuiMCP CLI",
	omitKeysOfUndefinedOptions: true, // 保持选项对象的整洁，只包含有实际值的选项
	version: await getPackageVersion(),
	hook: (event, command) => {
		logger.debug(`Command Hook: ${event}`, command);
	},
});
