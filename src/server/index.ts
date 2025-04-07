import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { bridge, muppet } from "muppet";
import "../resources/index.js";
import "../tools/index.js";
import { logger } from "../logger.js";
import { getSuiMCPState } from "../state/index.js";
import { getPackageVersion } from "../utils/version.js";
import { app } from "./app.js";

export async function startServer() {
	const { exists } = await getSuiMCPState();
	if (!exists) {
		logger.fatal(
			"Could not find the SuiMCP configuration. Please run `npx @jordangens/sui-mcp init` to create one.",
		);
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

	logger.info("SuiMCP started, listening on stdio");

	return await mcp;
}
