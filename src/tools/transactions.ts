import { type ToolResponseType, describeTool, mValidator } from "muppet";
import { z } from "zod";
import { app } from "../server/app.js";
import { optionalNetwork } from "../utils/schema.js";

app.post(
	"/get_transaction",
	describeTool({
		name: "get_transaction",
		description: "Get a transaction by its ID",
	}),
	mValidator(
		"json",
		z.object({
			network: optionalNetwork,
			digest: z
				.string()
				.describe("The ID of the transaction you'd like to get."),
		}),
	),
	async (c) => {
		const { network, digest } = c.req.valid("json");

		const transaction = await network.client.getTransactionBlock({
			digest,
			options: {
				showBalanceChanges: true,
				showEffects: true,
				showEvents: true,
				showObjectChanges: true,
				showInput: true,
			},
		});

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify(transaction, null, 2),
			},
		]);
	},
);
