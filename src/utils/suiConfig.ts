import fs from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { SIGNATURE_SCHEME_TO_FLAG } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Secp256k1Keypair } from "@mysten/sui/keypairs/secp256k1";
import { Secp256r1Keypair } from "@mysten/sui/keypairs/secp256r1";
import { fromBase64 } from "@mysten/sui/utils";
import yaml from "yaml";
import { z } from "zod";

const SUI_DIR = ".sui";
const SUI_CONFIG_DIR = "sui_config";
const SUI_CLIENT_CONFIG = "client.yaml";
const SUI_KEYSTORE_FILENAME = "sui.keystore";

function getSuiConfigDirectory() {
	return (
		process.env.SUI_CONFIG_DIR || path.join(homedir(), SUI_DIR, SUI_CONFIG_DIR)
	);
}

const ClientConfigSchema = z.object({
	// TODO: Add schema for keystore, once we actually need to process it.
	keystore: z.any(),
	// NOTE: This omits some fields, but we only care about these ones:
	envs: z.array(z.object({ alias: z.string(), rpc: z.string() })),
	active_env: z.string(),
	active_address: z.string(),
});

export async function getSuiClientConfig() {
	const configDir = getSuiConfigDirectory();
	const configPath = path.join(configDir, SUI_CLIENT_CONFIG);
	const file = await fs.readFile(configPath, "utf8");
	const config = yaml.parse(file);
	return ClientConfigSchema.parse(config);
}

const KEYPAIR_CONSTRUCTORS = {
	[SIGNATURE_SCHEME_TO_FLAG.ED25519]: Ed25519Keypair,
	[SIGNATURE_SCHEME_TO_FLAG.Secp256k1]: Secp256k1Keypair,
	[SIGNATURE_SCHEME_TO_FLAG.Secp256r1]: Secp256r1Keypair,
} as Record<
	string,
	typeof Ed25519Keypair | typeof Secp256k1Keypair | typeof Secp256r1Keypair
>;

export async function getSuiClientKeypairs() {
	const configDir = getSuiConfigDirectory();
	const keystorePath = path.join(configDir, SUI_KEYSTORE_FILENAME);

	const keystore = JSON.parse(
		await fs.readFile(keystorePath, "utf8"),
	) as string[];

	return keystore.map((key) => {
		const bytes = fromBase64(key);
		const scheme = bytes[0];
		const KeyPair = KEYPAIR_CONSTRUCTORS[scheme];

		if (!KeyPair) {
			throw new Error(`Unsupported key scheme: ${scheme}`);
		}

		const kp = KeyPair.fromSecretKey(bytes.slice(1));

		return {
			address: kp.toSuiAddress(),
			secretKey: kp.getSecretKey(),
		};
	});
}

export async function hasSuiClientKeypairs() {
	try {
		const kps = await getSuiClientKeypairs();
		return kps.length > 0;
	} catch {
		return false;
	}
}
