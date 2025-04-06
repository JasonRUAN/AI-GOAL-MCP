import { type ToolResponseType, describeTool, mValidator } from "muppet";
import { z } from "zod";
import { app } from "../server/app.js";
import { cli } from "../utils/suiCli.js";

app.post(
	"/set_current_network",
	describeTool({
		name: "set_current_network",
		description: "Set the current Sui network",
	}),
	mValidator(
		"json",
		z.object({
			alias: z.string(),
			url: z.string().optional(),
		}),
	),
	async (c) => {
		const { alias, url } = c.req.valid("json");

		const [envs] = await cli.envs();
		if (!envs.find((env) => env.alias === alias)) {
			if (!url) {
				throw new Error("Network is not yet configured, URL is required");
			}
			await cli.newEnv(alias, url);
		}

		await cli.switchEnv(alias);

		return c.json<ToolResponseType>({
			content: [{ type: "text", text: `Switched to "${alias}"` }],
		});
	},
);

app.post(
	"/get_current_network",
	describeTool({
		name: "get_current_network",
		description: "Get the current Sui network",
	}),
	mValidator("json", z.object({})),
	async (c) => {
		const env = await cli.getActiveEnv();

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: `The network is set to "${env.alias}", RPC URL "${env.rpc}"`,
			},
		]);
	},
);

app.post(
	"/list_networks",
	describeTool({
		name: "list_networks",
		description: "List all available Sui networks",
	}),
	mValidator("json", z.object({})),
	async (c) => {
		const [envs, activeEnv] = await cli.envs();

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify(
					{
						envs: envs.map((env) => ({
							alias: env.alias,
							url: env.rpc,
						})),
						current: activeEnv,
					},
					null,
					2,
				),
			},
		]);
	},
);
