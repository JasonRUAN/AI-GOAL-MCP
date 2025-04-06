import util from "node:util";
import { execFile } from "node:child_process";
import { SuiClient } from "@mysten/sui/client";

const execFileAsync = util.promisify(execFile);

export async function exec<T = string>(args: string[]): Promise<T> {
  const { stdout, stderr } = await execFileAsync("sui", [...args]);

  if (stderr) {
    throw new Error(stderr);
  }

  const ret = stdout.trim();

  try {
    if (ret.startsWith("[") || ret.startsWith("{")) {
      return JSON.parse(ret) as T;
    } else {
      return ret as T;
    }
  } catch {
    return ret as T;
  }
}

// NOTE: Technically we can avoid using the CLI for some of these commands and
// instead just parse the client config file directly, but this is easier for now.
export const cli = {
  version: async () => await exec(["--version"]),
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
        activeEnv: string
      ]
    >(["client", "envs", "--json"]),
  newEnv: async (alias: string, url: string) =>
    await exec(["client", "new-env", "--alias", alias, "--rpc", url]),
  switchEnv: async (env: string) =>
    await exec(["client", "switch", "--env", env]),

  async getActiveEnv() {
    const [envs, activeEnvAlias] = await cli.envs();

    const env = envs.find((env) => env.alias === activeEnvAlias);

    if (!env) {
      throw new Error(`Environment ${activeEnvAlias} not found`);
    }

    return env;
  },

  async getSuiClient() {
    const [envs, activeEnvAlias] = await cli.envs();

    const env = envs.find((env) => env.alias === activeEnvAlias);

    if (!env) {
      throw new Error(`Environment ${activeEnvAlias} not found`);
    }

    return new SuiClient({ url: env.rpc });
  },
};
