import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { bridge, muppet } from "muppet";
import { getLogger } from "../logger.js";
import "../resources/index.js";
import "../tools/index.js";
import { cli } from "../utils/suiCli.js";
import { getPackageVersion } from "../utils/version.js";
import { app } from "./app.js";

// TODO: Check if there's an active-env and active-address in the CLI, and prompt to set it up if not.
export async function startServer() {
	try {
		// Get the version of the Sui CLI to ensure it's installed and working.
		await cli.version();
	} catch (e) {
		getLogger().fatal(
			"Could not find the Sui CLI, please ensure that it is installed and try again.",
		);
		getLogger().fatal("https://docs.sui.io/references/cli");
		process.exit(1);
	}

	const mcp = muppet(app, {
		name: "SuiMCP",
		version: await getPackageVersion(),
	});

	await bridge({
		mcp,
		transport: new StdioServerTransport(),
	});

	getLogger().info("Sui MCP started, listening on stdio");

	// Hang promise:
	await new Promise(() => {});
}
