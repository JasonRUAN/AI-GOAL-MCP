import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import "../resources/index.js";
import "../tools/index.js";
import { bridge, muppet } from "muppet";
import { app } from "./app.js";
import { getLogger } from "../logger.js";
import { cli } from "../utils/suiCli.js";

export async function startServer() {
  // Get the version of the Sui CLI to ensure it's installed and working.
  await cli.version();

  const mcp = muppet(app, {
    name: "SuiMCP",
    version: "1.0.0",
  });

  await bridge({
    mcp,
    transport: new StdioServerTransport(),
  });

  getLogger().info("Sui MCP started, listening on stdio");

  // Hang promise:
  await new Promise(() => {});
}
