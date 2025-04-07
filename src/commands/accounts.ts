import { command, positional } from "@drizzle-team/brocli";
import {
	createNewAccount,
	deleteAccount,
	getSuiMCPState,
	setSuiMCPState,
} from "../state/index.js";

export const accounts = command({
	name: "accounts",
	desc: "Manage your SuiMCP accounts",
	subcommands: [
		command({
			name: "create",
			desc: "Create or import an account",
			handler: async () => {
				const { address } = await createNewAccount();
				console.log(`Added account: ${address}`);
			},
		}),
		command({
			name: "list",
			desc: "List all accounts",
			handler: async () => {
				const { state } = await getSuiMCPState();
				state.accounts.map((account) => {
					console.log(`- ${account.address}`);
				});
				console.log(`\nDefault Account: ${state.activeAddress}`);
			},
		}),
		command({
			name: "delete",
			desc: "Delete an account",
			options: {
				address: positional()
					.required()
					.desc("The address of the account to delete"),
			},
			handler: async ({ address }) => {
				await deleteAccount(address);
				console.log(`Deleted account: ${address}`);
			},
		}),
		command({
			name: "get-default",
			desc: "Get the default account",
			handler: async () => {
				const { state } = await getSuiMCPState();
				if (!state.activeAddress) {
					console.log("No default account found");
					return;
				}

				console.log(`Default account: ${state.activeAddress}`);
			},
		}),
		command({
			name: "set-default",
			desc: "Set the default account",
			options: {
				address: positional()
					.required()
					.desc("The address of the account to set as the default"),
			},
			handler: async ({ address }) => {
				const { state } = await getSuiMCPState();
				if (!state.accounts.find((account) => account.address === address)) {
					throw new Error(`Account ${address} not found`);
				}

				state.activeAddress = address;
				await setSuiMCPState(state);

				console.log(`Set default account to ${address}`);
			},
		}),
	],
});
