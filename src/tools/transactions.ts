import { describeTool, mValidator, type ToolResponseType } from "muppet";
import { z } from "zod";
import { cli } from "../utils/suiCli.js";
import { app } from "../server/app.js";

app.post(
  "/get-transaction",
  describeTool({
    name: "get-transaction",
    description: "Get a transaction by its ID",
  }),
  mValidator(
    "json",
    z.object({
      digest: z
        .string()
        .describe("The ID of the transaction you'd like to get."),
    })
  ),
  async (c) => {
    const { digest } = c.req.valid("json");

    const suiClient = await cli.getSuiClient();

    const transaction = await suiClient.getTransactionBlock({
      digest,
      options: {
        showBalanceChanges: true,
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
        showInput: true,
      },
    });

    return c.json<ToolResponseType>([
      {
        type: "text",
        text: JSON.stringify(transaction, null, 2),
      },
    ]);
  }
);
