import { stat } from "node:fs/promises";
import path from "node:path";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import fg from "fast-glob";
import { z } from "zod";
import { getLogger } from "../logger.js";
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
	.enum(["mainnet", "testnet", "devnet", "localnet"])
	.optional()
	.default("testnet")
	.describe("The network to use. If empty, defaults to 'testnet'.")
	.transform(async (network) => {
		return {
			alias: network,
			client: new SuiClient({ url: getFullnodeUrl(network) }),
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
