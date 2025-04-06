import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import keytar from "keytar";
import { z } from "zod";

const SUI_MCP_SERVICE = "sui-mcp";
const SUI_MCP_DIRECTORY = ".sui-mcp";

const SuiMCPStateSchema = z.object({
	version: z.literal("v1").default("v1"),
	service: z.literal("sui-mcp").default("sui-mcp"),
	activeAddress: z.string().nullish().default(null),
	accounts: z
		.array(
			z.object({
				address: z.string(),
			}),
		)
		.default([]),
});

function getStatePath() {
	return (
		process.env.SUI_MCP_STATE_PATH ??
		join(homedir(), SUI_MCP_DIRECTORY, "state.json")
	);
}

export async function importAccount(privateKey: string) {
	const { state } = await getSuiMCPState();

	const keypair = Ed25519Keypair.fromSecretKey(privateKey);

	await keytar.setPassword(SUI_MCP_SERVICE, keypair.toSuiAddress(), privateKey);

	state.accounts.push({
		address: keypair.toSuiAddress(),
	});

	state.activeAddress = keypair.toSuiAddress();

	await setSuiMCPState(state);

	return { address: keypair.toSuiAddress() };
}

export async function getSuiMCPState() {
	const statePath = getStatePath();

	try {
		if (!(await stat(statePath)).isFile()) {
			throw Error("State file does not exist or is not a file");
		}
	} catch {
		return {
			state: SuiMCPStateSchema.parse({}),
			exists: false,
		};
	}

	const state = SuiMCPStateSchema.parse(
		JSON.parse(await readFile(statePath, "utf8")),
	);

	return { state, exists: true };
}

export async function setSuiMCPState(state: z.infer<typeof SuiMCPStateSchema>) {
	const statePath = getStatePath();

	await mkdir(dirname(statePath), { recursive: true });

	await writeFile(statePath, JSON.stringify(state, null, 2));
}

export async function getKeypair(address: string) {
	const privateKey = await keytar.getPassword(SUI_MCP_SERVICE, address);

	if (!privateKey) {
		throw new Error(`Private key for address "${address}" not found`);
	}

	return Ed25519Keypair.fromSecretKey(privateKey);
}
