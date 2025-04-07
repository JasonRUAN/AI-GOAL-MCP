import { boolean, command } from "@drizzle-team/brocli";
import { confirm } from "@inquirer/prompts";
import {
	createNewAccount,
	getSuiMCPState,
	importAccount,
} from "../state/index.js";
import {
	getSuiClientKeypairs,
	hasSuiClientKeypairs,
} from "../utils/suiConfig.js";

async function importAccounts() {
	const kps = await getSuiClientKeypairs();

	for (const kp of kps) {
		const { address } = await importAccount(kp.secretKey);
		console.log(`Imported account ${address}`);
	}

	console.log(`Initialized SuiMCP with ${kps.length} accounts`);
}

async function createOrImportAccount() {
	console.log(
		"To use SuiMCP, you need to import an account. Enter a private key below, or leave empty to generate a new one",
	);

	const { address } = await createNewAccount();

	console.log(`Initialized SuiMCP with account ${address}`);
}

export const init = command({
	name: "init",
	desc: "Initialize SuiMCP",
	options: {
		force: boolean()
			.desc("Force initialization even if SuiMCP is already initialized")
			.default(false),
	},
	handler: async ({ force }) => {
		if (!force) {
			const { exists } = await getSuiMCPState();

			if (exists) {
				console.log("SuiMCP is already initialized, skipping initailization.");
				return;
			}
		}

		const hasAccounts = await hasSuiClientKeypairs();
		if (hasAccounts) {
			const confirmInit = await confirm({
				message: "Do you want to import your accounts from the Sui CLI?",
				default: true,
			});

			if (confirmInit) {
				await importAccounts();
			} else {
				await createOrImportAccount();
			}
		} else {
			await createOrImportAccount();
		}
	},
});
