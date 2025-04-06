import { Transaction } from "@mysten/sui/transactions";
import { type ToolResponseType, describeTool, mValidator } from "muppet";
import { z } from "zod";
import { app } from "../server/app.js";
import { getKeypair } from "../state/index.js";
import {
	moveDirectory,
	optionalAddress,
	optionalNetwork,
} from "../utils/schema.js";
import { getCli } from "../utils/suiCli.js";

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

		const cli = await getCli();

		const response = await cli.moveBuild(directory);

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: `${response.stdout}\n${response.stderr}`,
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

		const cli = await getCli();

		const response = await cli.moveTest(directory);

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: `${response.stdout}\n${response.stderr}`,
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
			"Publish a Sui Move package to the Sui blockchain. This tool will also run Move build and Move test.",
	}),
	mValidator(
		"json",
		z.object({
			address: optionalAddress,
			network: optionalNetwork,
			directory: moveDirectory,
		}),
	),
	async (c) => {
		const { directory, address, network } = c.req.valid("json");

		const cli = await getCli();

		const { modules, dependencies } = JSON.parse(
			(await cli.moveBuild(directory, { dumpBytecodeAsBase64: true })).stdout,
		);

		// TODO: Run tests and report results:
		// const test = await cli.moveTest(directory);

		const tx = new Transaction();

		tx.setSender(address);

		const cap = tx.publish({
			modules,
			dependencies,
		});

		tx.transferObjects([cap], address);

		const results = await network.client.signAndExecuteTransaction({
			transaction: tx,
			signer: await getKeypair(address),
			options: {
				showEffects: true,
				showBalanceChanges: true,
				showEvents: true,
			},
		});

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify(results, null, 2),
			},
		]);
	},
);
