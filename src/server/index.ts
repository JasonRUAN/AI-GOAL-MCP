import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import "../tools/index.js";
import { bridge, muppet } from "muppet";
import { app } from "./app.js";
import { getLogger } from "../logger.js";

export async function startServer() {
  const mcp = await muppet(app, {
    name: "SuiMCP",
    version: "1.0.0",
  });

  await bridge({
    mcp,
    transport: new StdioServerTransport(),
  });

  getLogger().info("Sui MCP started, listening on stdio");
}
