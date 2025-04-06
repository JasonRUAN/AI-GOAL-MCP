import { execFile } from "node:child_process";
import util from "node:util";
import { SuiClient } from "@mysten/sui/client";

const execFileAsync = util.promisify(execFile);

async function exec<T = string>(
	args: string[],
	{ blendedOutput }: { blendedOutput?: boolean } = {},
): Promise<T> {
	let { stdout, stderr } = await execFileAsync("sui", [...args]);

	if (!blendedOutput) {
		if (stderr) {
			throw new Error(stderr);
		}
	} else {
		stdout = `${stdout.trim()}\n${stderr.trim()}`;
	}

	const ret = stdout.trim();

	try {
		if (ret.startsWith("[") || ret.startsWith("{")) {
			return JSON.parse(ret) as T;
		}

		return ret as T;
	} catch {
		return ret as T;
	}
}

// NOTE: Technically we can avoid using the CLI for some of these commands and
// instead just parse the client config file directly, but this is easier for now.
export const cli = {
	version: async () => await exec(["--version"]),
	address: async () =>
		await exec<{
			activeAddress: string;
			addresses: [alias: string, address: string][];
		}>(["client", "addresses", "--json"]),
	activeAddress: async () => await exec(["client", "active-address"]),
	envs: async () =>
		await exec<
			[
				envs: {
					alias: "testnet";
					rpc: "https://fullnode.testnet.sui.io:443";
					ws: null;
					basic_auth: null;
				}[],
				activeEnv: string,
			]
		>(["client", "envs", "--json"]),
	newEnv: async (alias: string, url: string) =>
		await exec(["client", "new-env", "--alias", alias, "--rpc", url]),
	switchEnv: async (env: string) =>
		await exec(["client", "switch", "--env", env]),
	switchAddress: async (address: string) =>
		await exec(["client", "switch", "--address", address]),

	moveBuild: async (directory: string) =>
		await exec(["move", "build", "--path", directory, "--json-errors"], {
			blendedOutput: true,
		}),
	moveTest: async (directory: string) =>
		await exec(["move", "test", "--path", directory, "--json-errors"], {
			blendedOutput: true,
		}),
	publish: async (directory: string) =>
		await exec(["client", "publish", directory, "--json", "--json-errors"], {
			blendedOutput: true,
		}),

	async getActiveEnv() {
		const [envs, activeEnvAlias] = await cli.envs();

		const env = envs.find((env) => env.alias === activeEnvAlias);

		if (!env) {
			throw new Error(`Environment ${activeEnvAlias} not found`);
		}

		return env;
	},
};
