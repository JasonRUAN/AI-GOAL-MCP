import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { password } from "@inquirer/prompts";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Secp256k1Keypair } from "@mysten/sui/keypairs/secp256k1";
import { Secp256r1Keypair } from "@mysten/sui/keypairs/secp256r1";
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

const SCHEMA_TO_KEYPAIR_CONSTRUCTOR = {
	ED25519: Ed25519Keypair,
	Secp256k1: Secp256k1Keypair,
	Secp256r1: Secp256r1Keypair,
	// Unsuppored keypairs:
	MultiSig: null,
	ZkLogin: null,
	Passkey: null,
} as const;

export async function createNewAccount() {
	let privateKey = await password({
		message: "Private Key",
		mask: true,
	});

	if (!privateKey) {
		privateKey = Ed25519Keypair.generate().getSecretKey();
	}

	return await importAccount(privateKey);
}

export async function importAccount(privateKey: string) {
	const { state } = await getSuiMCPState();

	const { schema, secretKey } = decodeSuiPrivateKey(privateKey);

	const KeypairConstructor = SCHEMA_TO_KEYPAIR_CONSTRUCTOR[schema];

	if (!KeypairConstructor) {
		throw new Error(`Unsupported key scheme: ${schema}`);
	}

	const keypair = KeypairConstructor.fromSecretKey(secretKey);

	// keytar 会根据不同操作系统使用各自的安全密钥存储机制：
	//     - Windows: 使用凭据管理器 (Credential Manager)
	//     - macOS: 使用钥匙串 (Keychain)
	//     - Linux: 使用 libsecret 或 gnome-keyring
	// 在此代码中，它被用于安全存储加密货币钱包的私钥，以便应用程序可以在需要时安全地检索这些私钥，而不是将它们以明文形式存储在文件系统中。
	// 代码使用了常量 SUI_MCP_SERVICE（"sui-mcp"）作为服务名称，以区分这个应用程序存储的密钥与系统中其他应用程序存储的密钥。
	await keytar.setPassword(SUI_MCP_SERVICE, keypair.toSuiAddress(), privateKey);

	state.accounts.push({
		address: keypair.toSuiAddress(),
	});

	state.activeAddress = keypair.toSuiAddress();

	await setSuiMCPState(state);

	return { address: keypair.toSuiAddress() };
}

export async function deleteAccount(address: string) {
	const { state } = await getSuiMCPState();

	//  过滤掉要删除的账户
	state.accounts = state.accounts.filter(
		(account) => account.address !== address,
	);

	// 如果删除的是当前活跃账户，则更新活跃账户
	if (state.activeAddress === address) {
		state.activeAddress = state.accounts[0]?.address ?? null;
	}

	await keytar.deletePassword(SUI_MCP_SERVICE, address);

	await setSuiMCPState(state);
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
