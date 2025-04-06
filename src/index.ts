import path from "node:path";
import { boolean, command, run, string } from "@drizzle-team/brocli";
import { password } from "@inquirer/prompts";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getLogger, initLogger } from "./logger.js";
import { startServer } from "./server/index.js";
import { getSuiMCPState, importAccount } from "./state/index.js";
import { getPackageVersion } from "./utils/version.js";

const init = command({
	name: "init",
	handler: async () => {
		const { exists } = await getSuiMCPState();

		if (exists) {
			getLogger().info(
				"SuiMCP is already initialized, skipping initailization.",
			);
			return;
		}

		console.log(
			"To use SuiMCP, you need to improve an account. Enter a private key below, or leave empty to generate a new one",
		);

		let privateKey = await password({
			message: "Private Key",
		});

		if (!privateKey) {
			privateKey = Ed25519Keypair.generate().getSecretKey();
		}

		const { address } = await importAccount(privateKey);

		console.log(`Initialized SuiMCP with account ${address}`);
	},
});

const start = command({
	name: "start",
	handler: () => {
		startServer();
	},
});

run([start, init], {
	name: "sui-mcp",
	description: "SuiMCP CLI",
	omitKeysOfUndefinedOptions: true,
	version: await getPackageVersion(),
	globals: {
		// TODO: Clean up config and remove some of these flags now that we have the stderr debugging output.
		// These can just become ENV variables for overrides.

		clear: boolean().alias("c").desc("Clear the log file").default(false),

		logfile: string()
			.desc("The file you want to log to")
			.alias("f")
			.default(path.join(import.meta.dirname, "./sui-mcp.log")),

		loglevel: string()
			.enum("info", "debug", "warn", "error")
			.desc("The log level you want to use")
			.default("info"),
	},
	hook: (event, command, globals) => {
		if (event === "before") {
			initLogger({
				logfile: globals.logfile,
				loglevel: globals.loglevel,
				clear: globals.clear,
			});

			getLogger().debug(`Running command: ${JSON.stringify(command, null, 2)}`);
		} else if (event === "after") {
			getLogger().debug(
				`Command finished: ${JSON.stringify(command, null, 2)}`,
			);
		}
	},
});
