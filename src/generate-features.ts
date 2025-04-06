import { initLogger } from "./logger.js";
import { startServer } from "./server/index.js";

initLogger({ loglevel: "fatal" });

const mcp = await startServer();

const res = await mcp.fetch(
	new Request("https://localhost:3000/tools/list", { method: "POST" }),
);

const features = await res.json();

console.log(
	features.result.tools
		.map(
			(tool: { name: string; description: string }) =>
				`- **${tool.name}** - ${tool.description}`,
		)
		.join("\n"),
);

process.exit(0);
