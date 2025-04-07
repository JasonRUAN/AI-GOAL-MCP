import { stat } from "node:fs/promises";
import path from "node:path";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import fg from "fast-glob";
import { z } from "zod";
import { logger } from "../logger.js";
import { getSuiMCPState } from "../state/index.js";

export const optionalAddress = z
	.string()
	.trim()
	.optional()
	.describe(
		"The address of the wallet you'd like to use. If empty, defaults to the current wallet.",
	)
	.transform(async (address) => {
		const { state } = await getSuiMCPState();

		if (!address) {
			if (!state.activeAddress) {
				throw new Error("No address provided and no active address found");
			}

			return state.activeAddress;
		}

		return address;
	});

export const optionalNetwork = z
	.string()
	.trim()
	.optional()
	.default("testnet")
	.describe(
		"The network to use. Must be one of `mainnet`, `testnet`, `devnet`, or `localnet`. If empty, defaults to `testnet`.",
	)
	.transform(async (network) => {
		if (!network) {
			// biome-ignore lint/style/noParameterAssign: Ehhh it's fine.
			network = "testnet";
		}

		if (!["mainnet", "testnet", "devnet", "localnet"].includes(network)) {
			throw new Error(
				"Invalid network. Must be one of `mainnet`, `testnet`, `devnet`, or `localnet`",
			);
		}

		return {
			alias: network,
			client: new SuiClient({
				url: getFullnodeUrl(
					network as "mainnet" | "testnet" | "devnet" | "localnet",
				),
			}),
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
			logger.warn("Multiple Move.toml files found, using the shortest one");
		}

		return path.join(directory, path.dirname(moveToml[0]));
	});
