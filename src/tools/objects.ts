import { type ToolResponseType, describeTool, mValidator } from "muppet";
import { z } from "zod";
import { app } from "../server/app.js";
import { optionalAddress, optionalNetwork } from "../utils/schema.js";

app.post(
	"/get_object",
	describeTool({
		name: "get_object",
		description: "Get an object by its ID",
	}),
	mValidator(
		"json",
		z.object({
			network: optionalNetwork,
			id: z.string().describe("The ID of the object you'd like to get."),
		}),
	),
	async (c) => {
		const { network, id } = c.req.valid("json");

		const object = await network.client.getObject({
			id,
			options: {
				showType: true,
				showContent: true,
				showDisplay: true,
				showOwner: true,
				showPreviousTransaction: true,
				showStorageRebate: true,
			},
		});

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify(object, null, 2),
			},
		]);
	},
);

app.post(
	"/get_owned_objects",
	describeTool({
		name: "get_owned_objects",
		description: "Get objects owned by a wallet",
	}),
	mValidator(
		"json",
		z.object({
			network: optionalNetwork,
			address: optionalAddress,
		}),
	),
	async (c) => {
		const { network, address } = c.req.valid("json");

		const objects = await network.client.getOwnedObjects({
			owner: address,
			options: {
				showType: true,
				showDisplay: true,
				showContent: true,
				showPreviousTransaction: true,
				showStorageRebate: true,
			},
			// Filter out coin objects:
			filter: { MatchNone: [{ StructType: "0x2::coin::Coin" }] },
			// TODO: Pagination:
			limit: 50,
		});

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify(objects, null, 2),
			},
		]);
	},
);
