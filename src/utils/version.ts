import fs from "node:fs/promises";
import path from "node:path";

export async function getPackageVersion() {
	const packageJson = await fs.readFile(
		path.join(import.meta.dirname, "../../package.json"),
		"utf-8",
	);

	return JSON.parse(packageJson).version;
}
