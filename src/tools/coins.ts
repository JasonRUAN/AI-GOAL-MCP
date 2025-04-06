import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { type ToolResponseType, describeTool, mValidator } from "muppet";
import { z } from "zod";
import { app } from "../server/app.js";
import { optionalAddress, optionalNetwork } from "../utils/schema.js";
import { cli } from "../utils/suiCli.js";

app.post(
	"/get_balance",
	describeTool({
		name: "get_balance",
		description: "Get the balance of a specific coin type for a wallet",
	}),
	mValidator(
		"json",
		z.object({
			network: optionalNetwork,
			address: optionalAddress,
			coinType: z
				.string()
				.describe(
					"The coin type you'd like to get the balance for. Defaults to the SUI coin type.",
				)
				.default(SUI_TYPE_ARG),
		}),
	),
	async (c) => {
		const { network, address, coinType } = c.req.valid("json");

		const [balance, metadata] = await Promise.all([
			network.client.getBalance({
				owner: address,
				coinType,
			}),
			network.client.getCoinMetadata({ coinType }),
		]);

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify({
					// TODO: Format balance with decimals:
					balance,
					metadata,
				}),
			},
		]);
	},
);

app.post(
	"/get_all_balances",
	describeTool({
		name: "get_all_balances",
		description: "Get all balances for a wallet",
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

		const balances = await network.client.getAllBalances({
			owner: address,
		});

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify(balances, null, 2),
			},
		]);
	},
);

app.post(
	"/get_owned_coin_objects",
	describeTool({
		name: "get_owned_coin_objects",
		description: "Get coin objects owned by a wallet, by coin type",
	}),
	mValidator(
		"json",
		z.object({
			network: optionalNetwork,
			address: optionalAddress,
			coinType: z
				.string()
				.describe(
					"The coin type you'd like to get the coins for. Defaults to the SUI coin type.",
				)
				.default(SUI_TYPE_ARG),
		}),
	),
	async (c) => {
		const { network, address, coinType } = c.req.valid("json");

		const coins = await network.client.getCoins({
			owner: address,
			coinType,
			// TODO: Pagination:
			limit: 50,
		});

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify(coins, null, 2),
			},
		]);
	},
);
