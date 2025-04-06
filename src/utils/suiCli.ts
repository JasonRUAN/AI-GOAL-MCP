import { execFile } from "node:child_process";
import util from "node:util";
import { getLogger } from "../logger.js";

const execFileAsync = util.promisify(execFile);

export async function getCli() {
	const cli = {
		moveBuild: async (
			directory: string,
			options: { dumpBytecodeAsBase64?: boolean } = {},
		) =>
			await execFileAsync("sui", [
				"move",
				"build",
				"--path",
				directory,
				"--json-errors",
				options.dumpBytecodeAsBase64 ? "--dump-bytecode-as-base64" : "",
			]),

		moveTest: async (directory: string) =>
			await execFileAsync("sui", [
				"move",
				"test",
				"--path",
				directory,
				"--json-errors",
			]),
	};

	try {
		// Get the version of the Sui CLI to ensure it's installed and working.
		await execFileAsync("sui", ["--version"]);
	} catch (e) {
		getLogger().fatal(
			"Could not find the Sui CLI, please ensure that it is installed and try again.",
		);
		getLogger().fatal("https://docs.sui.io/references/cli");
		process.exit(1);
	}

	return cli;
}
