import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { bridge, muppet } from "muppet";
import { app } from "./app.js";
import "./tools/index.js";

// Creating a mcp using muppet
const mcp = muppet(app, {
  name: "SuiMCP",
  version: "1.0.0",
});

bridge({
  mcp,
  transport: new StdioServerTransport(),
});
