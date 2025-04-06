import { type ToolResponseType, describeTool, mValidator } from "muppet";
import { z } from "zod";
import { app } from "../server/app.js";
import { moveDirectory } from "../utils/schema.js";
import { cli } from "../utils/suiCli.js";

app.post(
	"/build_move_package",
	describeTool({
		name: "build_move_package",
		description: "Build a Sui Move package to bytecode",
	}),
	mValidator(
		"json",
		z.object({
			directory: moveDirectory,
		}),
	),
	async (c) => {
		const { directory } = c.req.valid("json");

		const response = await cli.moveBuild(directory);

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: response,
			},
		]);
	},
);

app.post(
	"/test_move_package	",
	describeTool({
		name: "test_move_package",
		description: "Test a Sui Move package",
	}),
	mValidator(
		"json",
		z.object({
			directory: moveDirectory,
		}),
	),
	async (c) => {
		const { directory } = c.req.valid("json");

		const response = await cli.moveTest(directory);

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: response,
			},
		]);
	},
);

// TODO: Maybe accept bytecode directly so that we can publish via TypeScript SDK and not need to go through CLI,
// and also so that agents can work with less fs access.
app.post(
	"/publish_move_package",
	describeTool({
		name: "publish_move_package",
		description:
			"Publish a Sui Move package to the Sui blockchain. This tool will also build the package.",
	}),
	mValidator(
		"json",
		z.object({
			directory: moveDirectory,
		}),
	),
	async (c) => {
		const { directory } = c.req.valid("json");

		const response = await cli.publish(directory);

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: response,
			},
		]);
	},
);
