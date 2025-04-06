import { stat } from "node:fs/promises";
import path from "node:path";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import fg from "fast-glob";
import { z } from "zod";
import { getLogger } from "../logger.js";
import { cli } from "./suiCli.js";

export const optionalAddress = z
	.string()
	.trim()
	.optional()
	.describe(
		"The address of the wallet you'd like to use. If empty, defaults to the current wallet.",
	)
	.transform(async (address) => {
		if (!address) {
			return await cli.activeAddress();
		}

		return address;
	});

const SUI_NETWORKS = ["mainnet", "testnet", "devnet", "localnet"] as const;
export const optionalNetwork = z
	.string()
	.trim()
	.optional()
	.describe(
		"The network to use. If empty, defaults to the current network. Can either be a Sui RPC URL, or a network alias (mainnet, testnet, devnet, or localnet).",
	)
	.transform(async (network) => {
		if (!network || !network.trim()) {
			const env = await cli.getActiveEnv();
			return {
				alias: env.alias,
				url: env.rpc,
				client: new SuiClient({ url: env.rpc }),
			};
		}

		if (network.startsWith("http")) {
			return {
				alias: "custom",
				url: network,
				client: new SuiClient({ url: network }),
			};
		}

		if (!SUI_NETWORKS.includes(network as (typeof SUI_NETWORKS)[number])) {
			throw new Error(`Invalid network provided: "${network}"`);
		}

		const url = getFullnodeUrl(network as (typeof SUI_NETWORKS)[number]);
		return {
			alias: network,
			url,
			client: new SuiClient({ url }),
		};
	});

export const moveDirectory = z
	.string()
	.startsWith("/")
	.describe(
		"The directory of the Move package. Must be an absolute path, starting with /",
	)
	.transform(async (directory) => {
		if (!(await stat(directory)).isDirectory()) {
			throw new Error("Directory does not exist");
		}

		const moveToml = (await fg(["**/Move.toml"], { cwd: directory })).sort(
			(a, b) => a.length - b.length,
		);

		if (moveToml.length === 0) {
			throw new Error("Move.toml not found");
		}

		if (moveToml.length > 1) {
			getLogger().warn(
				"Multiple Move.toml files found, using the shortest one",
			);
		}

		return path.join(directory, path.dirname(moveToml[0]));
	});
