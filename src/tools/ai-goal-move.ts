import { Transaction } from "@mysten/sui/transactions";
import { type ToolResponseType, describeTool, mValidator } from "muppet";
import { z } from "zod";
import { app } from "../server/app.js";
import { getKeypair } from "../state/index.js";
import {
	optionalAddress,
	optionalNetwork,
} from "../utils/schema.js";
import { CLOCK_OBJECT_ID, CONSTANTS } from "../constants/index.js";
import { bcs } from "@mysten/sui/bcs";

app.post(
	"/create_comment",
	describeTool({
		name: "create_comment",
		description:
			"Create a comment for the specified goal ID.",
	}),
	mValidator(
		"json",
		z.object({
			network: optionalNetwork,
            address: optionalAddress,
			goalId: z.number().describe("The ID of the goal you'd like to comment on."),
			comment: z.string().describe("The comment you'd like to create."),
		}),
	),
	async (c) => {
		const { network, address, goalId, comment } = c.req.valid("json");

		const tx = new Transaction();

		tx.setSender(address);

        tx.moveCall({
            target: CONSTANTS.AI_GOAL_CONTRACT.TARGET_CREATE_COMMENT,
            arguments: [
                tx.object(
                    CONSTANTS.AI_GOAL_CONTRACT.AI_GOAL_SHARED_OBJECT_ID
                ),
                tx.object(
                    CONSTANTS.AI_GOAL_CONTRACT
                        .AIG_TOKEN_VAULT_SHARED_OBJECT_ID
                ),
                tx.pure.u64(goalId),
                tx.pure.string(comment),
                tx.object(CLOCK_OBJECT_ID),
            ],
        });

		const results = await network.client.signAndExecuteTransaction({
			transaction: tx,
			signer: await getKeypair(address),
			options: {
				showEffects: true,
				showBalanceChanges: true,
				showEvents: true,
			},
		});

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify(results, null, 2),
			},
		]);
	},
);

app.post(
	"/update_progress",
	describeTool({
		name: "update_progress",
		description:
			"Update the progress of the specified goal ID.",
	}),
	mValidator(
		"json",
		z.object({
			network: optionalNetwork,
            address: optionalAddress,
			goalId: z.number().describe("The ID of the goal you'd like to update the progress of."),
			content: z.string().describe("The content of the progress update."),
            percentage: z.number().describe("The percentage of the progress update."),
            proofFileBlobId: z.string().optional().describe("The ID of the proof file walrus blob id."),
		}),
	),
	async (c) => {
		const { network, address, goalId, content, percentage, proofFileBlobId } = c.req.valid("json");

		const tx = new Transaction();

		tx.setSender(address);

        tx.moveCall({
            target: CONSTANTS.AI_GOAL_CONTRACT.TARGET_UPDATE_PROGRESS,
            arguments: [
                tx.object(
                    CONSTANTS.AI_GOAL_CONTRACT.AI_GOAL_SHARED_OBJECT_ID
                ),
                tx.object(
                    CONSTANTS.AI_GOAL_CONTRACT
                        .AIG_TOKEN_VAULT_SHARED_OBJECT_ID
                ),
                tx.pure.u64(goalId),
                tx.pure.string(content),
                tx.pure.u64(percentage),
                tx.pure.string(proofFileBlobId ?? ""),
                tx.object(CLOCK_OBJECT_ID),
            ],
        });

		const results = await network.client.signAndExecuteTransaction({
			transaction: tx,
			signer: await getKeypair(address),
			options: {
				showEffects: true,
				showBalanceChanges: true,
				showEvents: true,
			},
		});

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify(results, null, 2),
			},
		]);
	},
);

app.post(
	"/create_goal",
	describeTool({
		name: "create_goal",
		description:
			"Create a goal.",
	}),
	mValidator(
		"json",
		z.object({
			network: optionalNetwork,
            address: optionalAddress,
			title: z.string().describe("The title of the goal."),
            description: z.string().optional().describe("The description of the goal."),
            ai_suggestion: z.string().optional().describe("The AI suggestion of the goal."),
            deadline: z.number().describe("The deadline of the goal, in milliseconds."),
            witnesses: z.array(z.string()).describe("The list of witnesses for the goal."),
            amount: z.number().describe("The amount of SUI to stake to the goal."),
		}),
	),
	async (c) => {
		const { network, address, title, description, ai_suggestion, deadline, witnesses, amount } = c.req.valid("json");

		const tx = new Transaction();

		tx.setSender(address);

        tx.moveCall({
            target: CONSTANTS.AI_GOAL_CONTRACT.TARGET_CREATE_GOAL,
            arguments: [
                tx.object(
                    CONSTANTS.AI_GOAL_CONTRACT.AI_GOAL_SHARED_OBJECT_ID
                ),
                tx.object(
                    CONSTANTS.AI_GOAL_CONTRACT
                        .AIG_TOKEN_VAULT_SHARED_OBJECT_ID
                ),
                tx.pure.string(title),
                tx.pure.string(description ?? ""),
                tx.pure.string(ai_suggestion ?? ""),
                tx.pure.u64(deadline),
                tx.pure(bcs.vector(bcs.Address).serialize(witnesses)),
                tx.pure.u64(amount * 10 ** 9),
                tx.object(tx.gas),
                tx.object(CLOCK_OBJECT_ID),
            ],
        });

		const results = await network.client.signAndExecuteTransaction({
			transaction: tx,
			signer: await getKeypair(address),
			options: {
				showEffects: true,
				showBalanceChanges: true,
				showEvents: true,
			},
		});

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify(results, null, 2),
			},
		]);
	},
);

app.post(
	"/get_ai_suggestion",
	describeTool({
		name: "get_ai_suggestion",
		description:
			"Get an AI suggestion for a goal.",
	}),
	mValidator(
		"json",
		z.object({
			title: z.string().describe("The title of the goal."),
            description: z.string().optional().describe("The description of the goal."),
		}),
	),
	async (c) => {
		const { title, description } = c.req.valid("json");

		try {
			const response = await fetch(
				`${CONSTANTS.BACKEND_URL}/deepseek/get_ai_suggestion`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						content: `${title}\n${description || ""}`,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to generate suggestion");
			}

			const data = await response.json();

			return c.json<ToolResponseType>([
				{
					type: "text",
					text: JSON.stringify(data, null, 2),
				},
			]);
		} catch (error: unknown) {
			console.error("Failed to generate AI suggestion:", error);
            return c.json<ToolResponseType>([
                {
                    type: "text",
                    text: error instanceof Error ? error.message : "Unknown error occurred",
                },
            ]);
		}
	},
);