import { type ToolResponseType, describeTool, mValidator } from "muppet";
import { z } from "zod";
import { app } from "../server/app.js";
import { getSuiMCPState, setSuiMCPState } from "../state/index.js";

app.post(
	"/get_default_address",
	describeTool({
		name: "get_default_address",
		description: "Get the default wallet address",
	}),
	mValidator("json", z.object({})), // 验证请求体应该是一个空对象
	async (c) => {
		const { state } = await getSuiMCPState();

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: state.activeAddress || "No current default address found",
			},
		]);
	},
);

app.post(
	"/list_addresses",
	describeTool({
		name: "list_addresses",
		description: "List all addresses available for the current wallet",
	}),
	mValidator("json", z.object({})),
	async (c) => {
		const { state } = await getSuiMCPState();

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify(
					{
						activeAddress: state.activeAddress,
						addresses: state.accounts,
					},
					null,
					2,
				),
			},
		]);
	},
);

app.post(
	"/set_default_address",
	describeTool({
		name: "set_default_address",
		description: "Set the default address of the wallet",
	}),
	mValidator(
		"json",
		z.object({
			address: z
				.string()
				.describe("The address you want to set as the default"),
		}),
	),
	async (c) => {
		const { address } = c.req.valid("json");

		const { state } = await getSuiMCPState();

		if (!state.accounts.some((account) => account.address === address)) {
			throw new Error(`Address "${address}" not found`);
		}

		state.activeAddress = address;

		await setSuiMCPState(state);

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: `Switched to "${address}"`,
			},
		]);
	},
);
