import fs from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import yaml from 'yaml';
import { z } from 'zod';

const SUI_DIR = '.sui';
const SUI_CONFIG_DIR = 'sui_config'
const SUI_NETWORK_CONFIG = "network.yaml";
const SUI_FULLNODE_CONFIG = "fullnode.yaml";
const SUI_CLIENT_CONFIG = "client.yaml";
const SUI_KEYSTORE_FILENAME = "sui.keystore";
const SUI_KEYSTORE_ALIASES_FILENAME = "sui.aliases";

function getSuiConfigDirectory() {
	return process.env.SUI_CONFIG_DIR || path.join(homedir(), SUI_DIR, SUI_CONFIG_DIR);
}

const ClientConfigSchema = z.object({
	// TODO: Add schema for keystore, once we actually need to process it.
	keystore: z.any(),
	// NOTE: This omits some fields, but we only care about these ones:
	envs: z.array(z.object({alias: z.string(), rpc: z.string()})),
	active_env: z.string(),
	active_address: z.string(),
});

async function getSuiClientConfig() {
	const configDir = getSuiConfigDirectory();
	const configPath = path.join(configDir, SUI_CLIENT_CONFIG);
	const file = await fs.readFile(configPath, 'utf8');
	const config = yaml.parse(file);
	return ClientConfigSchema.parse(config);
}
